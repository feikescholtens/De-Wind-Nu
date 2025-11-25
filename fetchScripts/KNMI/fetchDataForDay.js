import fetch from "node-fetch"
import { KNMI_API_error } from "./helperFunctions.js"
import { theoreticalMeasurements, ISO_StringToLocalHHmm, processAllNegativeArrays } from "../fetchUtilFunctions.js"
import { catchFetchError, JSON_ParseError } from "../errorHandlingFunctions.js"
import { getFetchDates } from "./helperFunctionsForDay.js"








export async function fetchDataForDay_KNMI(dateParsed, databaseData, resolve, times, DSTDates) {

  let data = {}, // data is the object that will be returned
    rawData // rawData is the raw data fetched from the API

  const KNMI_ID = databaseData.measurements.API_ID
  const [dateStartFetch, dateEndFetch] = getFetchDates(dateParsed, DSTDates)
  const rawDataString = await fetch(`https://api.dataplatform.knmi.nl/edr/v1/collections/10-minute-in-situ-meteorological-observations/locations/${KNMI_ID}?datetime=${dateStartFetch}/${dateEndFetch}&parameter-name=ff,gff,dd`, { headers: { "Authorization": process.env.KDP_EDR_KEY } })
    .then(response => response.text()).catch((error) => catchFetchError(resolve, data, error, "KNMI")) // This handles all errors that can occur during the fetch, like timeouts or no internet connection
  try { rawData = JSON.parse(rawDataString) } catch { JSON_ParseError(rawDataString, resolve, "KNMI"); return } // If the data can't be parsed to JSON, log, resolve and return
  if (KNMI_API_error(rawData, resolve)) return // Check for error in the returned data

  // Define variables
  const windSpeed = [],
    windGust = [],
    windDirection = []
  let measurementTimes = []
  rawData.coverages[0].domain.axes.t.values.forEach(measurementTime => measurementTimes.push(ISO_StringToLocalHHmm(measurementTime, measurementTimes))) // Add all the times of the measurements to the measurementTimes array

  times.forEach(timeStamp => { // Loop through all the times that are requested [00:00, 00:10, ..., 00:00_nextDay]
    if (measurementTimes.includes(timeStamp) == false) { // If the time is not in the measurementTimes array, add -999 to all the data arrays to indicate that there is no data for this time (probably this time is in the future)
      [windSpeed, windGust, windDirection].forEach(array => array.push(-999));
      return
    }

    let indexTime = measurementTimes.indexOf(timeStamp)
    if (windSpeed[indexTime]) indexTime = measurementTimes.lastIndexOf(timeStamp) //Check if a time already exists in the data array. 
    // This only happens when the clock turns one hour back when timezones switch from CEST to CET. 02:00, 02:10, 02:20, 02:30, 02:40, 02:50 will 
    // already be in the data array, so look at the second value of these times in the measurementTimes array to get the right indici.

    if (rawData.coverages[0].ranges?.ff?.values[indexTime] != undefined) windSpeed.push(rawData.coverages[0].ranges.ff.values[indexTime] * 1.94384449) // Convert m/s to knots
    else windSpeed.push(-999)

    if (rawData.coverages[0].ranges?.gff?.values[indexTime] != undefined) windGust.push(rawData.coverages[0].ranges.gff.values[indexTime] * 1.94384449) // Convert m/s to knots
    else windGust.push(-999)

    if (rawData.coverages[0].ranges?.dd?.values[indexTime] != undefined) windDirection.push(rawData.coverages[0].ranges.dd.values[indexTime])
    else windDirection.push(-999)
  })

  const theoreticalMeasurementCount = theoreticalMeasurements(measurementTimes, times)
  for (let j = 0; j < (times.length - theoreticalMeasurementCount); j++)[windSpeed, windGust, windDirection].forEach(array => array.pop()) // Strip the data arrays of all the -999 values at the end

  data["KNMI"] = processAllNegativeArrays(windSpeed, windGust, windDirection)
  resolve({ data })
}