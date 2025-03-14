import { format, parseISO } from "date-fns"
import module from "date-fns-tz"
const { utcToZonedTime } = module






export function ISO_StringToLocalHHmm(ISO_String, measurementTimes) {
  const dateOBJ_UTC = parseISO(ISO_String)
  const dateOBJ_local = utcToZonedTime(dateOBJ_UTC, global.userTimeZone)
  let timeFormatted = format(dateOBJ_local, "HH:mm")

  if (timeFormatted == "00:00" && measurementTimes.length > 0) timeFormatted = "00:00_nextDay"
  return timeFormatted
}






export function processAllNegativeArrays(wind_speed, wind_gusts, wind_direction) {
  if (!wind_speed.some(value => value > 0)) wind_speed = []
  if (!wind_gusts.some(value => value > 0)) wind_gusts = []
  if (!wind_direction.some(value => value > 0)) wind_direction = []

  return [wind_speed, wind_gusts, wind_direction]
}







export function getMatchedIDs(locations, measurementSource) {
  let IDMatches = {}

  for (const id in locations) {
    if (locations[id].measurements.source !== measurementSource) continue
    IDMatches[locations[id].measurements.API_ID] = id
  }

  return IDMatches
}







export function theoreticalMeasurements(measurementTimes, times) {
  if (measurementTimes.length == 0) return 0

  const lastMeasurementTime = measurementTimes[measurementTimes.length - 1]
  const theoreticalMeasurementCount = times.indexOf(lastMeasurementTime)

  return theoreticalMeasurementCount + 1
}