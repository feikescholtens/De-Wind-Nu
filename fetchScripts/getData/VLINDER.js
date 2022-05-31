import { format, parse, subSeconds, add, formatISO, startOfDay } from "date-fns"
import module from "date-fns-tz"
const { utcToZonedTime } = module
import fetch from "node-fetch"
import { readFileSync } from "fs"
import { catchError, JSONError, theoreticalMeasurements } from "../fetchUtilFunctions.js"
const timeZone = "Europe/Amsterdam"

Array.prototype.copy = function() { return JSON.parse(JSON.stringify(this)) }

export async function fetchVLINDER(dateParsed, databaseData, resolve, times) {

  let data = []
  console.log(dateParsed)
  console.log(startOfDay(dateParsed))

  const locationID = databaseData.datasets.VLINDER.location_id
  const dateStartFetch = subSeconds(dateParsed, 1).toISOString()
  const dateEndFetch = add(dateParsed, { days: 1, seconds: 1 }).toISOString()
  console.log(dateStartFetch, dateEndFetch)
  console.log(formatISO(subSeconds(dateParsed, 1)), formatISO(add(dateParsed, { days: 1, seconds: 1 })))
  const rawDataString = await fetch(`https://mooncake.ugent.be/api/measurements/${locationID}?start=${dateStartFetch}&end=${dateEndFetch}`)
    .then(response => response.text()).catch((error) => catchError(resolve, data, error, "VLINDER"))
  console.log(`https://mooncake.ugent.be/api/measurements/${locationID}?start=${dateStartFetch}&end=${dateEndFetch}`)
  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }
  // rawData = JSON.parse(readFileSync("projectFiles/test files DST/from CET to CEST/VLINDER.json"))

  if (JSONError(rawData)) rawData = [] //Prevent errors by saying there are 0 measurements
  console.log(rawData[0])
  let wind_speed = [],
    wind_gusts = [],
    wind_direction = []
  let measurementTimes = []

  rawData.forEach(measurement => {
    let time = format(utcToZonedTime(parse(measurement.time.substring(5, measurement.time.length - 4) + " Z", "dd MMM yyyy HH:mm:ss X", new Date()), timeZone), "HH:mm")
    if (time == "00:00" && measurementTimes.length > 0) time = "00:00_nextDay"
    measurementTimes.push(time)
  })

  console.log(measurementTimes)

  times.forEach(timeStamp => {
    if (!measurementTimes.includes(timeStamp)) {
      wind_speed.push(-999)
      wind_gusts.push(-999)
      wind_direction.push(-999)
      return
    }

    const indexTime = measurementTimes.indexOf(timeStamp)
    if (rawData[indexTime].windSpeed || rawData[indexTime].windSpeed == 0) {
      wind_speed.push(rawData[indexTime].windSpeed * 0.53995726994149)
    } else {
      wind_speed.push(-999)
    }

    if (rawData[indexTime].windGust || rawData[indexTime].windGust == 0) {
      wind_gusts.push(rawData[indexTime].windGust * 0.53995726994149)
    } else wind_gusts.push(-999)

    if (rawData[indexTime].windDirection || rawData[indexTime].windDirection == 0) {
      wind_direction.push(rawData[indexTime].windDirection)
    } else wind_direction.push(-999)
  })

  const theoreticalMeasurementCount = theoreticalMeasurements(measurementTimes, times)
  if (!theoreticalMeasurementCount) {
    resolve({
      data: {
        VLINDER: [
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
  console.log(wind_speed)
  data["VLINDER"] = [wind_speed, wind_gusts, wind_direction]
  resolve({ data })
}