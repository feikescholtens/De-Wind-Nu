import { format, parse } from "date-fns"
import module from "date-fns-tz"
const { utcToZonedTime } = module
import fetch from "node-fetch"
import { catchError, theoreticalMeasurements } from "../fetchUtilFunctions.js"
import { JSONErrorVLINDER, VLINDERerror } from "./helperFunctions.js"
import { getFetchDates } from "./helperFunctionsForDay.js"

export async function fetchDataForDay_VLINDER(dateParsed, databaseData, resolve, times, DSTDates) {

  let data = {}, // data is the object that will be returned
    rawData // rawData is the raw data fetched from the API

  const locationID = databaseData.measurements.API_ID


  const [dateStartFetch, dateEndFetch] = getFetchDates(dateParsed, DSTDates)

  const rawDataString = await fetch(`https://mooncake.ugent.be/api/measurements/${locationID}?start=${dateStartFetch}&end=${dateEndFetch}`)
    .then(response => response.text()).catch((error) => catchError(resolve, data, error, "VLINDER"))
  try { rawData = JSON.parse(rawDataString) } catch { return }
  if (VLINDERerror(rawData, resolve)) return

  if (JSONErrorVLINDER(rawData)) rawData = [] //Prevent errors by saying there are 0 measurements
  let wind_speed = [],
    wind_gusts = [],
    wind_direction = []
  let measurementTimes = []

  rawData.forEach(measurement => {
    let time = format(utcToZonedTime(parse(measurement.time.substring(5, measurement.time.length - 4) + " Z", "dd MMM yyyy HH:mm:ss X", new Date()), global.userTimeZone), "HH:mm")
    if (time == "00:00" && measurementTimes.length > 0) time = "00:00_nextDay"
    measurementTimes.push(time)
  })

  times.forEach(timeStamp => {
    if (!measurementTimes.includes(timeStamp)) {
      wind_speed.push(-999)
      wind_gusts.push(-999)
      wind_direction.push(-999)
      return
    }

    let indexTime = measurementTimes.indexOf(timeStamp)
    if (wind_speed[indexTime]) indexTime = measurementTimes.lastIndexOf(timeStamp) //Check if a value already exists in the wind_speed array (doesn't 
    // matter if wind_speed array or one of the others).
    // This only happens when the clock turns one hour back when timezones switch from CEST to CET. 02:00, 02:05, 02:10, 02:15, 02:20, 02:25, 
    // 02:30, 02:35, 02:40, 02:45, 02:50, 20:55 will 
    // already be in the temprary array, so look at the second value of these times in the measurementTimes array to get the right indici.
    // !!!This code needs a big annotation, see project notes in Goole Keep under 'known bugs'

    if (rawData[indexTime].windSpeed != undefined) {
      wind_speed.push(rawData[indexTime].windSpeed * 0.53995726994149)
    } else wind_speed.push(-999)

    if (rawData[indexTime].windGust != undefined) {
      wind_gusts.push(rawData[indexTime].windGust * 0.53995726994149)
    } else wind_gusts.push(-999)

    if (rawData[indexTime].windDirection != undefined) {
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

  data["VLINDER"] = [wind_speed, wind_gusts, wind_direction]
  resolve({ data })
}