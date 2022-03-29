import { format, parseISO } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
import fetch from "node-fetch"
import { readFileSync } from "fs"
import { catchError, theoreticalMeasurements, SuccesvolFalseError, giveRWSFetchOptions, processAllNegativeArrays } from "../fetchUtilFunctions.js"

Array.prototype.copy = function() { return JSON.parse(JSON.stringify(this)) }

const timeZone = "Europe/Amsterdam"

export async function fetchRWS(databaseData, resolve, times, DSTDates) {

  let data = []

  const dateUTC = new Date()
  const dateZoned = utcToZonedTime(dateUTC, timeZone)

  const rawDataString = await fetch("https://waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGENSERVICES_DBO/OphalenWaarnemingen", giveRWSFetchOptions(databaseData, dateZoned, DSTDates))
    .then(response => response.text()).catch((error) => catchError(resolve, data, error, "RWS"))

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }
  // rawData = JSON.parse(readFileSync("projectFiles/test files DST/from CET to CEST/RWS.json"))

  if (SuccesvolFalseError(rawData, databaseData.name, data, resolve)) return

  //Declare variables
  let wind_speed = [],
    wind_gusts = [],
    wind_direction = []

  if (rawData.WaarnemingenLijst) {
    rawData.WaarnemingenLijst.forEach(measurementType => {
      console.log(measurementType.MetingenLijst[0])
      if (measurementType.MetingenLijst.length == 0) return

      let measurementTimes = [],
        tempArray = []

      measurementType.MetingenLijst.forEach(measurement => {
        let time = format(utcToZonedTime(parseISO(measurement.Tijdstip), timeZone), "HH:mm")
        console.log("------------------")
        console.log(measurement.Tijdstip)
        console.log(parseISO(measurement.Tijdstip))
        console.log(utcToZonedTime(parseISO(measurement.Tijdstip), timeZone))
        console.log(time)
        measurementTimes.push(time)
      })

      times.forEach(timeStamp => {
        if (!measurementTimes.includes(timeStamp)) {
          tempArray.push(-999)
          return
        }

        const indexTime = measurementTimes.indexOf(timeStamp)

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