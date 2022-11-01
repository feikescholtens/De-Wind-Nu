import { format, parseISO } from "date-fns"
import module from "date-fns-tz"
const { utcToZonedTime } = module
import fetch from "node-fetch"
import { readFileSync } from "fs"
import { catchError, theoreticalMeasurements, SuccesvolFalseError, giveRWSFetchOptions, processAllNegativeArrays } from "../fetchUtilFunctions.js"

Array.prototype.copy = function() { return JSON.parse(JSON.stringify(this)) }

const timeZone = "Europe/Amsterdam"

export async function fetchRWS(dateParsed, databaseData, resolve, times, DSTDates) {

  let data = []

  const rawDataString = await fetch("https://waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGENSERVICES_DBO/OphalenWaarnemingen", giveRWSFetchOptions(dateParsed, databaseData, DSTDates))
    .then(response => response.text()).catch((error) => catchError(resolve, data, error, "RWS"))

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }
  // rawData = JSON.parse(readFileSync("projectFiles/test files DST/from CET to CEST/RWS.json"))

  if (SuccesvolFalseError(rawData, resolve)) return

  //Declare variables
  let wind_speed = [],
    wind_gusts = [],
    wind_direction = []

  if (rawData.WaarnemingenLijst) {
    rawData.WaarnemingenLijst.forEach(measurementType => {
      if (measurementType.MetingenLijst.length == 0) return

      let measurementTimes = [],
        tempArray = []

      measurementType.MetingenLijst.forEach(measurement => {
        let time = format(utcToZonedTime(parseISO(measurement.Tijdstip), timeZone), "HH:mm")
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

        if (measurementType.MetingenLijst[indexTime]) {
          if (measurementType.MetingenLijst[indexTime].Meetwaarde) {
            if (measurementType.MetingenLijst[indexTime].Meetwaarde.Waarde_Numeriek) {
              if (measurementType.MetingenLijst[indexTime].Meetwaarde.Waarde_Numeriek >= 999) {
                tempArray.push(-999)
              } else tempArray.push(measurementType.MetingenLijst[indexTime].Meetwaarde.Waarde_Numeriek)
            } else tempArray.push(-999)
          } else tempArray.push(-999)
        } else tempArray.push(-999)
      })

      const theoreticalMeasurementCount = theoreticalMeasurements(measurementTimes, times)

      for (let j = 0; j < (times.length - theoreticalMeasurementCount); j++) {
        tempArray.pop()
      }

      if (measurementType.AquoMetadata.Grootheid.Code == "WINDSHD") wind_speed = tempArray.copy().map(x => x * 1.94384449)
      if (measurementType.AquoMetadata.Grootheid.Code == "WINDSTOOT") wind_gusts = tempArray.copy().map(x => x * 1.94384449)
      if (measurementType.AquoMetadata.Grootheid.Code == "WINDRTG") wind_direction = tempArray.copy()
    })
  }

  data["Rijkswaterstaat"] = processAllNegativeArrays(wind_speed, wind_gusts, wind_direction)
  resolve({ data })

}