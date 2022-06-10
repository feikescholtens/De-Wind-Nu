import { format, parseISO } from "date-fns"
import module from "date-fns-tz"
const { utcToZonedTime } = module
import fetch from "node-fetch"
import { readFileSync } from "fs"
import { catchError, theoreticalMeasurements, processAllNegativeArrays } from "../fetchUtilFunctions.js"
const timeZone = "Europe/Amsterdam"

export async function fetchKNMI(dateParsed, databaseData, resolve, times) {

  let data = []

  const locationID = databaseData.datasets.KNMI.location_id
  const dateStartFetch = format(dateParsed, "yyyy-M-d")
  console.log(dateStartFetch)

  console.log(utcToZonedTime(dateParsed, timeZone))
  console.log(format(utcToZonedTime(dateParsed, timeZone), "yyyy-M-d"))
  const rawDataString = await fetch(`https://graphdata.buienradar.nl/1.0/actualarchive/weatherstation/${locationID}/?startDate=${dateStartFetch}`)
    .then(response => response.text()).catch((error) => catchError(resolve, data, error, "KNMI"))

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }
  // rawData = JSON.parse(readFileSync("projectFiles/test files DST/from CET to CEST/KNMI.json"))

  let wind_speed = [],
    wind_gusts = [],
    wind_direction = []
  let measurementTimes = []

  const UTCOffset = rawData.timeOffset

  rawData.observations.forEach(measurement => {
    let time = format(utcToZonedTime(parseISO(measurement.datetime + "+0" + UTCOffset + ":00"), timeZone), "HH:mm")
    if (time == "00:00" && measurementTimes.length > 0) time = "00:00_nextDay"
    measurementTimes.push(time)
  })

  //Needed to remove measurements from the next day (only needed on the day of switching to DST)
  if (measurementTimes.indexOf("00:00_nextDay") !== -1) measurementTimes = measurementTimes.slice(0, measurementTimes.indexOf("00:00_nextDay") + 1)

  times.forEach(timeStamp => {
    if (!measurementTimes.includes(timeStamp)) {
      wind_speed.push(-999)
      wind_gusts.push(-999)
      wind_direction.push(-999)
      return
    }

    let indexTime = measurementTimes.indexOf(timeStamp)

    if (rawData.observations[indexTime].values.ff && rawData.observations[indexTime].values.ff >= 0) {
      wind_speed.push(rawData.observations[indexTime].values.ff * 0.53995726994149)
    } else wind_speed.push(-999)

    if (rawData.observations[indexTime].values.fx && rawData.observations[indexTime].values.fx >= 0) {
      wind_gusts.push(rawData.observations[indexTime].values.fx * 0.53995726994149)
    } else wind_gusts.push(-999)

    if (rawData.observations[indexTime].values.dd && rawData.observations[indexTime].values.dd >= 0) {
      wind_direction.push(rawData.observations[indexTime].values.dd)
    } else wind_direction.push(-999)
  })

  const theoreticalMeasurementCount = theoreticalMeasurements(measurementTimes, times)
  if (!theoreticalMeasurementCount) {
    resolve({
      data: {
        KNMI: [
          [],
          [],
          []
        ]
      }
    })
    return
  }

  for (let j = 0; j < (times.length - theoreticalMeasurementCount); j++) {
    wind_speed.pop()
    wind_gusts.pop()
    wind_direction.pop()
  }

  data["KNMI"] = processAllNegativeArrays(wind_speed, wind_gusts, wind_direction)
  resolve({ data })
}