import { format, parseISO } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
import fetch from "node-fetch"
import { readFileSync } from "fs"
import { catchError, theoreticalMeasurements, processAllNegativeArrays } from "../fetchUtilFunctions.js"
const timeZone = "Europe/Amsterdam"

export async function fetchKNMI(databaseData, resolve, times) {

  let data = []

  const locationID = databaseData.datasets.KNMI.location_id
  const dateUTC = new Date()
  const dateZoned = utcToZonedTime(dateUTC, timeZone)
  const dateTodayFetch = format(dateZoned, "yyyy-M-d")

  const rawDataString = await fetch(`https://graphdata.buienradar.nl/1.0/actualarchive/weatherstation/${locationID}/?startDate=${dateTodayFetch}`)
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
    measurementTimes.push(time)
  })

  times.forEach(timeStamp => {
    if (!measurementTimes.includes(timeStamp)) {
      wind_speed.push(-999)
      wind_gusts.push(-999)
      wind_direction.push(-999)
      return
    }

    const indexTime = measurementTimes.indexOf(timeStamp)

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