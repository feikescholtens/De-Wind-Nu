import { format, parseISO } from "date-fns"
import module from "date-fns-tz"
const { utcToZonedTime } = module
import { log } from "../serverFunctions.js"


export function resolveEmptyArrays(resolve, measurementSource) {

  const data = {}
  data[measurementSource] = [
    [],
    [],
    []
  ]
  resolve({ data })

}

export function ISO_StringToLocalHHmm(ISO_String, measurementTimes) {
  const dateOBJ_UTC = parseISO(ISO_String)
  const dateOBJ_local = utcToZonedTime(dateOBJ_UTC, global.userTimeZone)
  let timeFormatted = format(dateOBJ_local, "HH:mm")

  if (timeFormatted == "00:00" && measurementTimes.length > 0) timeFormatted = "00:00_nextDay"
  return timeFormatted
}


export function logFetchErrors(dataFetched, response) {
  if (!dataFetched) return

  const errorCode = dataFetched.data.error.code

  if (errorCode == "ENOTFOUND")
    log(`API endpoint ${dataFetched.data.dataset} doesn't exist, or there's a network error! (${errorCode})`, "fetchError", true)
  else if (errorCode == "ECONNRESET" || errorCode == "EPROTO")
    log(`Network problem reaching API! (${errorCode})`, "fetchError", true)
  else if (errorCode == "EHOSTUNREACH")
    log(`Network problem reaching API! (${errorCode})`, "fetchError", true)
  else if (errorCode == "ETIMEDOUT")
    log(`Request timed out of API ${dataFetched.data.dataset}! (${errorCode})`, "fetchError", true)
  else if (errorCode == "ERR_INVALID_URL")
    log(`Invalid URL! (${errorCode})`, "fetchError", true)
  else {
    log(JSON.stringify(dataFetched), "fetchError", true)
    response.redirect('/error')
  }
}

export function catchError(resolve, data, error, dataset) {
  data = { error: error, dataset: dataset }
  resolve({ data })
  console.log({ data })
}

export function processAllNegativeArrays(wind_speed, wind_gusts, wind_direction) {
  if (!wind_speed.some(value => value > 0)) wind_speed = []
  if (!wind_gusts.some(value => value > 0)) wind_gusts = []
  if (!wind_direction.some(value => value > 0)) wind_direction = []

  //This error is not handled here, just return empty array(s)

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