import fetch from "node-fetch"
import { getUnixTime, add, parse } from "date-fns"
import { readFileSync } from "fs"
import { MessageError, giveMVBOverviewFetchOptions } from "../fetchUtilFunctions.js"

export async function overviewFetchMVB(locations, resolve) {

  //Getting API key, if gotten, make request for data
  if (Object.keys(MVBAPIKey).length == 0 || (getUnixTime(new Date()) + 5) > MVBAPIKey.expirationDate) {

    const rawDataString = await fetch("https://api.meetnetvlaamsebanken.be/Token", {
      "headers": {
        "content-type": "application/x-www-form-urlencoded charset=UTF-8"
      },
      "body": `grant_type=password&username=${process.env.APP_EMAIL}&password=${process.env.MVB_PWD_ENCODED}`,
      "method": "POST"
    }).then(response => response.text())

    let rawData
    try { rawData = JSON.parse(rawDataString) } catch { return }
    if (MessageError(rawData, [], resolve)) return

    fetchDataMVB(rawData["access_token"])

    const expiresString = add(parse(rawData[".expires"], "EEE, dd MMM yyyy HH:mm:ss 'GMT'", new Date()), { hours: 1 })
    const issuedString = add(parse(rawData[".issued"], "EEE, dd MMM yyyy HH:mm:ss 'GMT'", new Date()), { hours: 1 })
    MVBAPIKey = {
      "expirationDate": getUnixTime(expiresString),
      "issuedDate": getUnixTime(issuedString),
      "APIKey": rawData["access_token"]
    }

  } else {
    fetchDataMVB()
  }

  async function fetchDataMVB(newToken) {

    let locationsArray = [],
      IDMatches = []

    locations.forEach(location => {
      if (Object.keys(location.datasets)[0] !== "MVB") return

      location.datasets.MVB.location_id.forEach(measurementType => {
        if (measurementType.includes("WC3")) return
        locationsArray.push(measurementType)

        IDMatches.push({
          applicationID: location.id,
          MVB: measurementType
        })
      })

    })

    const rawDataString = await fetch("https://api.meetnetvlaamsebanken.be/V2/CurrentData", giveMVBOverviewFetchOptions(locationsArray, newToken))
      .then(response => response.text())

    let rawData
    try { rawData = JSON.parse(rawDataString) } catch { return }
    if (MessageError(rawData, [], resolve)) return

    let data = {}

    rawData.forEach(locationData => {

      // Match reveived location with one from own list to get application ID for each location
      for (let i = 0; i < IDMatches.length; i++) {
        if (IDMatches[i].MVB == locationData.ID) {

          if (locationData.ID.includes("WVC")) {
            const wind_speed = locationData.Value * 1.94384449

            if (!data[IDMatches[i].applicationID]) data[IDMatches[i].applicationID] = { wind_speed: wind_speed }
            else data[IDMatches[i].applicationID].wind_speed = wind_speed
          }
          if (locationData.ID.includes("WRS")) {
            const wind_direction = locationData.Value

            if (!data[IDMatches[i].applicationID]) data[IDMatches[i].applicationID] = { wind_direction: wind_direction }
            else data[IDMatches[i].applicationID].wind_direction = wind_direction
          }

          break
        }
      }

    })

    resolve(data)
  }
}