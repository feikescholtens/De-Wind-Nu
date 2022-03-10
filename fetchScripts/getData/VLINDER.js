import { format, parse, startOfToday } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
import fetch from "node-fetch"
import { catchError, JSONError, theoreticalMeasurements } from "../fetchUtilFunctions.js"
const timeZone = "Europe/Amsterdam"

Array.prototype.copy = function() { return JSON.parse(JSON.stringify(this)) }

export async function fetchVLINDER(databaseData, resolve, times) {

  let data = []

  const locationID = databaseData.datasets.VLINDER.location_id

  const rawDataString = await fetch(`https://mooncake.ugent.be/api/measurements/${locationID}`)
    .then(response => response.text()).catch((error) => catchError(resolve, data, error, "VLINDER"))

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }

  if (JSONError(rawData)) rawData = [] //Prevent errors by saying there are 0 measurements

  let wind_speed = [],
    wind_gusts = [],
    wind_direction = []
  let measurementTimes = []

  //Remove measurements from yesterday
  let indexToday
  for (indexToday = 0; indexToday < rawData.length; indexToday++) {
    let time = parse(rawData[indexToday].time.substring(5, rawData[indexToday].time.length - 4) + " Z", "dd MMM yyyy HH:mm:ss X", new Date())
    if (utcToZonedTime(time, timeZone).getTime() == startOfToday(utcToZonedTime(new Date(), timeZone)).getTime()) break
  }
  rawData.splice(0, indexToday)

  rawData.forEach(measurement => {
    let time = format(utcToZonedTime(parse(measurement.time.substring(5, measurement.time.length - 4) + " Z", "dd MMM yyyy HH:mm:ss X", new Date()), timeZone), "HH:mm")
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

  const theoreticalMeasurementCount = theoreticalMeasurements(measurementTimes, 5)
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

  data["VLINDER"] = [wind_speed, wind_gusts, wind_direction]
  resolve({ data })
}