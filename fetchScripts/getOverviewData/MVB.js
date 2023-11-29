import fetch from "node-fetch"
import { getUnixTime, add, parse, parseISO } from "date-fns"
import { readFileSync } from "fs"
import { MessageError, giveMVBOverviewFetchOptions } from "../fetchUtilFunctions.js"

export async function overviewFetchMVB(locations, resolve) {

  //Getting API key, if gotten, make request for data
  if (Object.keys(MVBAPIKey).length == 0 || (getUnixTime(new Date()) + 5) > MVBAPIKey.expirationDate) {

    const rawDataString = await fetch("https://api.meetnetvlaamsebanken.be/Token", {
      "headers": {
        "content-type": "application/x-www-form-urlencoded charset=UTF-8"
      },
      "body": `grant_type=password&username=dewindnu@gmail.com&password=${process.env.MVB_PWD_ENCODED}`,
      "method": "POST"
    }).then(response => response.text())

    let rawData
    try { rawData = JSON.parse(rawDataString) } catch { return }
    if (MessageError(rawData, resolve)) return

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

    for (const id in locations) {
      if (locations[id].MVB_IDs) {
        locations[id].MVB_IDs.forEach(measurementType => {
          locationsArray.push(measurementType)

          IDMatches.push({
            applicationID: id,
            MVB: measurementType
          })
        })
      }
    }

    const rawDataString = await fetch("https://api.meetnetvlaamsebanken.be/V2/CurrentData", giveMVBOverviewFetchOptions(locationsArray, newToken))
      .then(response => response.text())

    let rawData
    try { rawData = JSON.parse(rawDataString) } catch { return }
    if (MessageError(rawData, resolve)) return

    let data = {}

    rawData.forEach(locationData => {

      // Match reveived location with one from own list to get application ID for each location
      for (let i = 0; i < IDMatches.length; i++) {
        if (IDMatches[i].MVB == locationData.ID) {

          if (locationData.ID.includes("WVC")) {
            const windSpeed = locationData.Value * 1.94384449

            if (!data[IDMatches[i].applicationID]) data[IDMatches[i].applicationID] = { windSpeed: windSpeed }
            else data[IDMatches[i].applicationID].windSpeed = windSpeed

            data[IDMatches[i].applicationID].timeStamp = parseISO(locationData.Timestamp).toISOString()
          }
          if (locationData.ID.includes("WC3")) {
            const windGusts = locationData.Value * 1.94384449

            if (!data[IDMatches[i].applicationID]) data[IDMatches[i].applicationID] = { windGusts: windGusts }
            else data[IDMatches[i].applicationID].windGusts = windGusts
          }
          if (locationData.ID.includes("WRS")) {
            const windDirection = locationData.Value

            if (!data[IDMatches[i].applicationID]) data[IDMatches[i].applicationID] = { windDirection: windDirection }
            else data[IDMatches[i].applicationID].windDirection = windDirection
          }

          break
        }
      }

    })

    resolve(data)
  }
}