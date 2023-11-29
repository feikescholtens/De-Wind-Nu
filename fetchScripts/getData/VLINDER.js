import { format, parse, subSeconds, add, addHours, subHours, isSameDay } from "date-fns"
import module from "date-fns-tz"
const { utcToZonedTime } = module
import fetch from "node-fetch"
import { readFileSync } from "fs"
import { catchError, JSONErrorVLINDER, theoreticalMeasurements, VLINDERerror } from "../fetchUtilFunctions.js"
const timeZone = "Europe/Amsterdam"

Array.prototype.copy = function() { return JSON.parse(JSON.stringify(this)) }

export async function fetchVLINDER(dateParsed, databaseData, resolve, times, DSTDates) {

  let data = []

  const locationID = databaseData.VLINDER_ID
  const dateStartFetch = subSeconds(dateParsed, 1).toISOString()

  let dateEndFetch = add(dateParsed, { days: 1, seconds: 1 })
  if (isSameDay(dateParsed, DSTDates.fromDST) && global.serverTimeZone === "UTC") dateEndFetch = addHours(dateEndFetch, 1).toISOString()
  // Check if the date requested is the day of switching from summertime to wintertime. This day contains 25 hours, and since UTC doesn't include DST, it just 
  // adds 24 hours in the addDays function above. The requested data will therefore miss 1 hour of data for the requested day.
  else if (isSameDay(dateParsed, DSTDates.toDST) && global.serverTimeZone === "UTC") dateEndFetch = subHours(dateEndFetch, 1).toISOString()
  // Check if the date requested is the day of switching from wintertime to summertime. This day contains 23 hours, and since UTC doesn't include DST, it just 
  // adds 24 hours in the addDays function above. The requested data will therefore contain 1 extra hour (of the day after) which will confuse the rest of the script and cause a bug.
  else dateEndFetch = dateEndFetch.toISOString()

  const rawDataString = await fetch(`https://mooncake.ugent.be/api/measurements/${locationID}?start=${dateStartFetch}&end=${dateEndFetch}`)
    .then(response => response.text()).catch((error) => catchError(resolve, data, error, "VLINDER"))
  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }
  // rawData = JSON.parse(readFileSync("projectFiles/test files DST/from CET to CEST/VLINDER.json"))
  if (VLINDERerror(rawData, resolve)) return

  if (JSONErrorVLINDER(rawData)) rawData = [] //Prevent errors by saying there are 0 measurements
  let wind_speed = [],
    wind_gusts = [],
    wind_direction = []
  let measurementTimes = []

  rawData.forEach(measurement => {
    let time = format(utcToZonedTime(parse(measurement.time.substring(5, measurement.time.length - 4) + " Z", "dd MMM yyyy HH:mm:ss X", new Date()), timeZone), "HH:mm")
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