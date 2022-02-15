import { format, parseISO, getUnixTime } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
import fetch from "node-fetch"
import { existsSync, readFileSync } from 'fs'
import { catchError, MessageError, saveNewApiKey, theoreticalMeasurements, giveMVBFetchOptions } from "../fetchUtilFunctions.js"

Array.prototype.copy = function() { return JSON.parse(JSON.stringify(this)) }

export async function fetchMVB(databaseData, resolve, times) {

  let data = []

  //Getting API key, if gotten, make request for data
  let MVBAPIKey
  if (existsSync("Meetnet Vlaamse Banken API key.json")) MVBAPIKey = JSON.parse(readFileSync("Meetnet Vlaamse Banken API key.json"))
  else MVBAPIKey = {}

  if (Object.keys(MVBAPIKey).length == 0 || (getUnixTime(new Date()) + 5) > MVBAPIKey.expirationDate) {

    const rawDataString = await fetch("https://api.meetnetvlaamsebanken.be/Token", {
      "headers": {
        "content-type": "application/x-www-form-urlencoded charset=UTF-8"
      },
      "body": `grant_type=password&username=${process.env.APP_EMAIL}&password=${process.env.MVB_PWD_ENCODED}`,
      "method": "POST"
    }).then(response => response.text()).catch((error) => catchError(resolve, data, error, "MVB"))

    let rawData
    try { rawData = JSON.parse(rawDataString) } catch { return }
    if (MessageError(rawData, data, resolve)) return

    fetchDataMVB(rawData["access_token"])

    saveNewApiKey(rawData)

  } else {
    fetchDataMVB()
  }

  async function fetchDataMVB(newToken) {

    const timeZone = "Europe/Amsterdam"
    const dateUTC = new Date()
    const dateZoned = utcToZonedTime(dateUTC, timeZone)

    const rawDataString = await fetch("https://api.meetnetvlaamsebanken.be/V2/getData", giveMVBFetchOptions(databaseData, dateZoned, newToken))
      .then(response => response.text()).catch((error) => catchError(resolve, data, error, "MVB"))

    let rawData
    try { rawData = JSON.parse(rawDataString) } catch { return }
    // rawData = JSON.parse(readFileSync("projectFiles/discontinuous test data MVB.json"))
    if (MessageError(rawData, data, resolve)) return

    //Declare variables
    let wind_speed = [],
      wind_gusts = [],
      wind_direction = []

    rawData.Values.forEach(measurementType => {
      if (measurementType.Values.length == 0) return

      let measurementTimes = [],
        tempArray = []

      measurementType.Values.forEach(measurement => {
        let time = format(utcToZonedTime(parseISO(measurement.Timestamp), timeZone), "HH:mm")
        measurementTimes.push(time)
      })

      times.forEach(timeStamp => {
        if (!measurementTimes.includes(timeStamp)) {
          tempArray.push(-999)
          return
        }

        const indexTime = measurementTimes.indexOf(timeStamp)

        if (measurementType.Values[indexTime]) {
          if (measurementType.Values[indexTime].Value) {
            tempArray.push(measurementType.Values[indexTime].Value)
          } else tempArray.push(-999)
        } else tempArray.push(-999)
      })

      const theoreticalMeasurementCount = theoreticalMeasurements(measurementTimes)

      for (let j = 0; j < (times.length - theoreticalMeasurementCount); j++) {
        tempArray.pop()
      }

      if (measurementType.ID.includes("WC3")) wind_gusts = tempArray.copy().map(x => x * 1.94384449)
      if (measurementType.ID.includes("WVC")) wind_speed = tempArray.copy().map(x => x * 1.94384449)
      if (measurementType.ID.includes("WRS")) wind_direction = tempArray.copy()
    })

    data["MVB"] = [wind_speed, wind_gusts, wind_direction]
    resolve({ data })
  }
}