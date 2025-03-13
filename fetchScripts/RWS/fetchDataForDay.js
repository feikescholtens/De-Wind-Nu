import fetch from "node-fetch"
import { catchError, processAllNegativeArrays, theoreticalMeasurements, resolveEmptyArrays, ISO_StringToLocalHHmm } from "../fetchUtilFunctions.js"
import { SuccesvolFalseError } from "./helperFunctions.js"
import { giveRWSFetchOptions } from "./helperFunctionsForDay.js"
import { log } from "../../serverFunctions.js"






export async function fetchDataForDay_RWS(dateParsed, databaseData, resolve, times, DSTDates) {

  let data = {}, // data is the object that will be returned
    rawData // rawData is the raw data fetched from the API

  const rawDataString = await fetch("https://waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGENSERVICES_DBO/OphalenWaarnemingen", giveRWSFetchOptions(dateParsed, databaseData, DSTDates))
    .then(response => response.text()).catch((error) => catchError(resolve, data, error, "RWS")) // This handles all errors that can occur during the fetch, like timeouts or no internet connection
  try { rawData = JSON.parse(rawDataString) } catch { // If the data can't be parsed to JSON, log, resolve and return
    resolveEmptyArrays(resolve, "RWS")
    log(`Error parsing JSON, rawDataString is equal to: ${rawDataString}`, "error", true)
    return
  }
  if (SuccesvolFalseError(rawData, resolve)) return // RWS API returns false for "Succesvol" when there is no data, which is convenient

  // Define variables
  let wind_speed = [],
    wind_gusts = [],
    wind_direction = []

  if (rawData.WaarnemingenLijst == undefined) { resolveEmptyArrays(resolve, "RWS"); return } // If there is no data, return empty arrays. This should not happen, since SuccesvolFalseError should have already returned

  rawData.WaarnemingenLijst.forEach(parameter => { // Loop through all the parameters in the data, like wind speed, gusts and direction
    if (parameter.MetingenLijst.length == 0) return // If there are no measurements for this parameter, return

    let measurementTimes = [], // MeasurementTimes is just an array with all the times of the measurements for this parameter
      tempArray = [] // This contains the actual measurements for the parameter that's being looped through

    parameter.MetingenLijst.forEach(measurement => measurementTimes.push(ISO_StringToLocalHHmm(measurement.Tijdstip, measurementTimes))) // Add all the times of the measurements to the measurementTimes array

    times.forEach(timeStamp => { // Loop through all the times that are requested [00:00, 00:10, ..., 00:00_nextDay]
      if (measurementTimes.includes(timeStamp) == false) { tempArray.push(-999); return } // If the time is not in the measurementTimes array, add -999 to the tempArray to indicate that there is no data for this time (probably this time is in the future)

      let indexTime = measurementTimes.indexOf(timeStamp)
      if (tempArray[indexTime]) indexTime = measurementTimes.lastIndexOf(timeStamp) //Check if a time already exists in the temporary array. 
      // This only happens when the clock turns one hour back when timezones switch from CEST to CET. 02:00, 02:10, 02:20, 02:30, 02:40, 02:50 will 
      // already be in the temprary array, so look at the second value of these times in the measurementTimes array to get the right indici.

      if (parameter.MetingenLijst[indexTime] == undefined) { tempArray.push(-999); return }
      if (parameter.MetingenLijst[indexTime].Meetwaarde == undefined) { tempArray.push(-999); return }
      if (parameter.MetingenLijst[indexTime].Meetwaarde.Waarde_Numeriek == undefined) { tempArray.push(-999); return }
      if (parameter.MetingenLijst[indexTime].Meetwaarde.Waarde_Numeriek >= 999) { tempArray.push(-999); return }
      tempArray.push(parameter.MetingenLijst[indexTime].Meetwaarde.Waarde_Numeriek)
    })

    const theoreticalMeasurementCount = theoreticalMeasurements(measurementTimes, times) // The amount of measurements that should be there, based on the length of the measurementTimes array
    for (let j = 0; j < (times.length - theoreticalMeasurementCount); j++) tempArray.pop() // Strip the tempArray of all the -999 values at the end

    // Set the wind_speed, wind_gusts and wind_direction arrays based on the parameter that's being looped through
    if (parameter.AquoMetadata.Grootheid.Code == "WINDSHD") wind_speed = tempArray.customCopy().map(x => x * 1.94384449) // Convert m/s to knots
    if (parameter.AquoMetadata.Grootheid.Code == "WINDSTOOT") wind_gusts = tempArray.customCopy().map(x => x * 1.94384449) // Convert m/s to knots
    if (parameter.AquoMetadata.Grootheid.Code == "WINDRTG") wind_direction = tempArray.customCopy()
  })

  data["RWS"] = processAllNegativeArrays(wind_speed, wind_gusts, wind_direction)
  resolve({ data })
}