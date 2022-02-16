import { readFileSync, writeFile } from "fs"
import fetch from "node-fetch"
import jsdom from "jsdom"
const { JSDOM } = jsdom
import { JWT } from "google-auth-library"
import { parseISO, format } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
const timeZone = "Europe/Amsterdam"

let retryCount = 0
const maxRetries = 5 - 1
export async function getForecast(forecastData, resolve) {

  log("Checking new forecast run...", "info", true)

  const HTML = await fetch("https://www.euroszeilen.utwente.nl/weer/grib/").then(response => response.text())
  const DOM = new JSDOM(HTML)
  const runInformationNode = DOM.window.document.querySelector(".container:nth-child(2) .row:nth-child(4) div p")
  runInformationNode.querySelector("span").remove()
  const timeString = runInformationNode.textContent.substring(0, 16) + "Z"

  const timeMostRecentRun = parseISO(timeString)
  const timeSavedRun = parseISO(`${forecastData.timeRun}Z`)

  if (timeMostRecentRun <= timeSavedRun) {
    if (retryCount < maxRetries) {
      setTimeout(() => { getForecast(forecastData, resolve) }, 5 * 60 * 1000)
      retryCount++
      log("New forecast run not available yet, scheduled new request in 5 minutes!", "info", true)
      return
    } else {
      log("Forecast was not available after 5 times trying!", "error", true)
      retryCount = 0
      resolve("ENOTAVAILABLE")
      return
    }
  }

  log("New run available, fetching and saving it...", "info", true)
  retryCount = 0

  const JSWClient = new JWT(
    process.env.GCP_CLIENT_EMAIL,
    null,
    process.env.GCP_PRIVATE_KEY,
    []
  )
  const accessID = await JSWClient.fetchIdToken(process.env.GCP_AUDIENCE)

  const locationsFetch = giveLocationsFetch()
  const fetchOptions = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessID}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ "locations": locationsFetch })
  }
  const forecastString = await fetch("https://europe-west1-de-wind-nu.cloudfunctions.net/parseGribHarmonie", fetchOptions)
    .catch(error => log(error, "error", true))
    .then(response => response.text())

  try {
    let forecastJson = JSON.parse(forecastString)

    if (forecastJson.timeRun == forecastData.timeRun) {
      if (retryCount < maxRetries) {
        setTimeout(() => { getForecast(forecastData, resolve) }, 5 * 60 * 1000)
        retryCount++
        log("New forecast run not available yet, scheduled new request in 5 minutes!", "info", true)
        return
      } else {
        log("Forecast was not available after 5 times trying!", "error", true)
        resolve("ENOTAVAILABLE")
        return
      }
    }

    for (let i = 0; i < Object.keys(forecastJson).length - 1; i++) {
      const locationID = Object.keys(forecastJson)[i]

      if (!forecastData[locationID]) forecastData[locationID] = []
      else {
        //Deleting old forecasts (for which newer is available)
        const dateToday = format(utcToZonedTime(new Date(), timeZone), "dd-MM-yyyy")
        const dateFirstForecastData = forecastJson[locationID][0].time
        const indexTimeNewForecast = forecastData[locationID].findIndex(location => location.time == dateFirstForecastData && location.date == dateToday)
        const NoTimesToDelete = forecastData[locationID].length - indexTimeNewForecast

        for (let j = 0; j < NoTimesToDelete; j++) {
          forecastData[locationID].pop()
        }
      }

      //Combining the forecast arrays with the new data
      forecastData[locationID] = forecastData[locationID].concat(forecastJson[locationID])
    }

    forecastData["timeRun"] = forecastJson["timeRun"]

    writeFile("forecastData.json", JSON.stringify(forecastData, null, 2), error => {
      if (error) {
        log(error, "error", true)
        return
      } else {
        log("New forecast run saved!", "info", true)
        resolve(forecastData)
        return
      }
    })
  } catch (error) {
    log(error, "error", true)
  }
}

export function deleteForecastYesterday(forecastData) {

  if (Object.keys(forecastData).length <= 1) return forecastData

  //Working in CET
  const dateToday = format(utcToZonedTime(new Date(), timeZone), "dd-MM-yyyy")
  const timeFirstForecastData = forecastData[Object.keys(forecastData)[0]][0].time.substring(0, 5)
  const dateFirstForecastData = forecastData[Object.keys(forecastData)[0]][0].date

  if (timeFirstForecastData == "00:00" && dateFirstForecastData == dateToday) return forecastData

  const indexFirstForecastTimeToday = forecastData[Object.keys(forecastData)[0]].findIndex(location => location.time == "00:00" && location.date == dateToday) //Equals the No. hours to delete
  if (indexFirstForecastTimeToday == -1) return forecastData

  for (let i = 0; i < Object.keys(forecastData).length - 1; i++) {
    for (let j = 0; j < indexFirstForecastTimeToday; j++) {
      forecastData[Object.keys(forecastData)[i]].shift()
    }
  }

  writeFile("forecastData.json", JSON.stringify(forecastData, null, 2), error => {
    if (error) log(error, "error", true)
    else log("Removed forecast data from yesterday!", "info", true)
  })

  return forecastData
}

function giveLocationsFetch() {
  const locations = JSON.parse(readFileSync("locations.json"))
  let locationsFetch = []

  for (let i = 0; i < locations.length; i++) {

    locationsFetch.push({
      id: locations[i].id,
      lat: parseFloat(parseFloat(locations[i].lat).toFixed(4)),
      lon: parseFloat(parseFloat(locations[i].lon).toFixed(4))
    })
  }

  return locationsFetch
}