import { format, addDays, addHours, subHours, isSameDay } from "date-fns"
import module from "date-fns-tz"
const { utcToZonedTime } = module
import fetch from "node-fetch"
import { catchError, theoreticalMeasurements, KNMIerror } from "../fetchUtilFunctions.js"
const timeZone = "Europe/Amsterdam"

Array.prototype.copy = function() { return JSON.parse(JSON.stringify(this)) }

export async function fetchKNMI(dateParsed, databaseData, resolve, times, DSTDates) {

  let data = []

  const locationID = databaseData.KNMI_ID
  const dateStartFetch = dateParsed.toISOString()

  let dateEndFetch = addDays(dateParsed, 1)
  if (isSameDay(dateParsed, DSTDates.fromDST) && global.serverTimeZone === "UTC") dateEndFetch = addHours(dateEndFetch, 1).toISOString()
  // Check if the date requested is the day of switching from summertime to wintertime. This day contains 25 hours, and since UTC doesn't include DST, it just 
  // adds 24 hours in the addDays function above. The requested data will therefore miss 1 hour of data for the requested day.
  else if (isSameDay(dateParsed, DSTDates.toDST) && global.serverTimeZone === "UTC") dateEndFetch = subHours(dateEndFetch, 1).toISOString()
  // Check if the date requested is the day of switching from wintertime to summertime. This day contains 23 hours, and since UTC doesn't include DST, it just 
  // adds 24 hours in the addDays function above. The requested data will therefore contain 1 extra hour (of the day after) which will confuse the rest of the script and cause a bug.
  else dateEndFetch = dateEndFetch.toISOString()

  const rawDataString = await fetch(`https://api.dataplatform.knmi.nl/edr/collections/observations/locations/${locationID}?datetime=${dateStartFetch}/${dateEndFetch}&parameter-name=ff_10m_10,fx_10m_10,dd_10`, { headers: { "Authorization": process.env.KDP_EDR_KEY } })
    .then(response => response.text()).catch((error) => catchError(resolve, data, error, "KNMI"))
  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }
  if (KNMIerror(rawData, resolve)) return

  let wind_speed = [],
    wind_gusts = [],
    wind_direction = []
  let measurementTimes = []

  rawData.domain.axes.t.values.forEach(measurementTime => {
    let time = format(utcToZonedTime(measurementTime, timeZone), "HH:mm")
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
    if (wind_speed[indexTime]) indexTime = measurementTimes.lastIndexOf(timeStamp) //Check if a time already exists in the temporary array. 
    // This only happens when the clock turns one hour back when timezones switch from CEST to CET. 02:00, 02:10, 02:20, 02:30, 02:40, 02:50 will 
    // already be in the temprary array, so look at the second value of these times in the measurementTimes array to get the right indici.

    if (rawData.ranges.ff_10m_10.values[indexTime] != undefined) {
      wind_speed.push(rawData.ranges.ff_10m_10.values[indexTime] * 1.94384449)
    } else wind_speed.push(-999)

    if (rawData.ranges.fx_10m_10.values[indexTime] != undefined) {
      wind_gusts.push(rawData.ranges.fx_10m_10.values[indexTime] * 1.94384449)
    } else wind_gusts.push(-999)

    if (rawData.ranges.dd_10.values[indexTime] != undefined) {
      wind_direction.push(rawData.ranges.dd_10.values[indexTime])
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

  data["KNMI"] = [wind_speed, wind_gusts, wind_direction]
  resolve({ data })
}