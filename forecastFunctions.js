import { readFileSync, writeFile } from "fs"
import fetch from "node-fetch"
import jsdom from "jsdom"
const { JSDOM } = jsdom
import { parseISO, format } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
const timeZone = "Europe/Amsterdam"

let retryCount = 0
const maxRetries = 5 - 1
export async function getForecast(forecastData, resolve) {

  console.log("Checking new forecast run...")

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
      console.log("New forecast run not available yet, scheduled new request in 5 minutes!")
      return
    } else {
      console.log("Forecast was not available after 5 times trying!")
      retryCount = 0
      resolve("ENOTAVAILABLE")
      return
    }
  }

  console.log("New run available, fetching and saving it...")
  retryCount = 0

  const locationsFetch = giveLocationsFetch()
  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ "locations": locationsFetch })
  }
  const forecastString = await fetch("https://europe-west1-de-wind-nu.cloudfunctions.net/parseGribHarmonie", fetchOptions)
    .catch(error => console.log(error))
    .then(response => response.text())

  try {
    let forecastJson = JSON.parse(forecastString)

    if (forecastJson.timeRun == forecastData.timeRun) {
      if (retryCount < maxRetries) {
        setTimeout(() => { getForecast(forecastData, resolve) }, 5 * 60 * 1000)
        retryCount++
        console.log("New forecast run not available yet, scheduled new request in 5 minutes!")
        return
      } else {
        console.log("Forecast was not available after 5 times trying!")
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

        console.log("dateToday: " + dateToday)
        console.log("dateFirstForecastData: " + dateFirstForecastData)

        const indexTimeNewForecast = forecastData[locationID].findIndex(location => location.time == dateFirstForecastData && location.date == dateToday)
        const NoTimesToDelete = forecastData[locationID].length - indexTimeNewForecast

        console.log("NoTimesToDelete: " + NoTimesToDelete)


        for (let j = 0; j < NoTimesToDelete; j++) {
          forecastData[locationID].pop()
        }
      }

      //Combining the forecast arrays with the new data
      forecastData[locationID] = forecastData[locationID].concat(forecastJson[locationID])
    }

    forecastData["timeRun"] = forecastJson["timeRun"]

    writeFile("forecastData.json", JSON.stringify(forecastData, null, 2), (err) => {
      if (err) {
        console.log(err)
        return
      } else {
        console.log("New forecast run saved!")
        resolve(forecastData)
        return
      }
    })
  } catch (error) {
    console.log(error)
  }
}

export function deleteForecastYesterday(forecastData) {
  console.log("DELETING FORECAST RUN FROM YESTERDAY")
  if (Object.keys(forecastData).length <= 1) return forecastData

  //Working in CET
  const dateToday = format(utcToZonedTime(new Date(), timeZone), "dd-MM-yyyy")
  const timeFirstForecastData = forecastData[Object.keys(forecastData)[0]][0].time.substring(0, 5)
  const dateFirstForecastData = forecastData[Object.keys(forecastData)[0]][0].date

  console.log("dateToday: " + dateToday)
  console.log("timeFirstForecastData: " + timeFirstForecastData)
  console.log("dateFirstForecastData: " + dateFirstForecastData)

  if (timeFirstForecastData == "00:00" && dateFirstForecastData == dateToday) return forecastData

  const indexFirstForecastTimeToday = forecastData[Object.keys(forecastData)[0]].findIndex(location => location.time == "00:00" && location.date == dateToday)
  if (indexFirstForecastTimeToday == -1) return forecastData
  const hoursToDelete = indexFirstForecastTimeToday

  console.log("hoursToDelete: " + hoursToDelete)


  for (let i = 0; i < Object.keys(forecastData).length - 1; i++) {
    for (let j = 0; j < hoursToDelete; j++) {
      forecastData[Object.keys(forecastData)[i]].shift()
    }
  }

  writeFile("forecastData.json", JSON.stringify(forecastData, null, 2), (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log("Removed forecast data from yesterday!")
    }
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