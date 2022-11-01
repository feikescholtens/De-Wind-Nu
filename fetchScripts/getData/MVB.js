import { format, parseISO, getUnixTime, addHours, parse } from "date-fns"
import module from "date-fns-tz"
const { utcToZonedTime } = module
import fetch from "node-fetch"
import { readFileSync } from "fs"
import { catchError, MessageError, theoreticalMeasurements, giveMVBFetchOptions } from "../fetchUtilFunctions.js"

Array.prototype.copy = function() { return JSON.parse(JSON.stringify(this)) }

export async function fetchMVB(dateParsed, databaseData, resolve, times, DSTDates) {

  let data = []

  //Getting API key, if gotten, make request for data
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
    if (MessageError(rawData, resolve)) return

    fetchDataMVB(rawData["access_token"])

    const expiresString = addHours(parse(rawData[".expires"], "EEE, dd MMM yyyy HH:mm:ss 'GMT'", new Date()), 1)
    const issuedString = addHours(parse(rawData[".issued"], "EEE, dd MMM yyyy HH:mm:ss 'GMT'", new Date()), 1)
    MVBAPIKey = {
      "expirationDate": getUnixTime(expiresString),
      "issuedDate": getUnixTime(issuedString),
      "APIKey": rawData["access_token"]
    }

  } else {
    fetchDataMVB()
  }

  async function fetchDataMVB(newToken) {

    const timeZone = "Europe/Amsterdam"

    const rawDataString = await fetch("https://api.meetnetvlaamsebanken.be/V2/getData", giveMVBFetchOptions(dateParsed, DSTDates, databaseData, newToken))
      .then(response => response.text()).catch((error) => catchError(resolve, data, error, "MVB"))

    let rawData
    try { rawData = JSON.parse(rawDataString) } catch { return }
    // rawData = JSON.parse(readFileSync("projectFiles/discontinuous test data MVB.json"))
    // rawData = JSON.parse(readFileSync("projectFiles/test files DST/from CET to CEST/MVB.json"))
    if (MessageError(rawData, resolve)) return

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
        if (time == "00:00" && measurementTimes.length > 0) time = "00:00_nextDay"
        measurementTimes.push(time)
      })

      times.forEach(timeStamp => {
        if (!measurementTimes.includes(timeStamp)) {
          tempArray.push(-999)
          return
        }

        let indexTime = measurementTimes.indexOf(timeStamp)
        if (tempArray[indexTime]) indexTime = measurementTimes.lastIndexOf(timeStamp) //Check if a time already exists in the temporary array. 
        // This only happens when the clock turns one hour back when timezones switch from CEST to CET. 02:00, 02:10, 02:20, 02:30, 02:40, 02:50 will 
        // already be in the temprary array, so look at the second value of these times in the measurementTimes array to get the right indici.

        if (measurementType.Values[indexTime]) {
          if (measurementType.Values[indexTime].Value) {
            tempArray.push(measurementType.Values[indexTime].Value)
          } else tempArray.push(-999)
        } else tempArray.push(-999)
      })

      const theoreticalMeasurementCount = theoreticalMeasurements(measurementTimes, times)

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