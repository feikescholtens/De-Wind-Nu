import { log } from "../serverFunctions.js"






export function catchFetchError(resolve, data, error, dataset) {
  data = { error: error, dataset: dataset }
  resolve({ data })

  const errorCode = error.code

  if (errorCode == "ENOTFOUND")
    log(`API endpoint ${dataset} doesn't exist, or there's a network error! (${errorCode})`, "fetchError", true)
  else if (errorCode == "ECONNRESET" || errorCode == "EPROTO")
    log(`Network problem reaching API! (${errorCode})`, "fetchError", true)
  else if (errorCode == "EHOSTUNREACH")
    log(`Network problem reaching API! (${errorCode})`, "fetchError", true)
  else if (errorCode == "ETIMEDOUT")
    log(`Request timed out of API ${dataset}! (${errorCode})`, "fetchError", true)
  else if (errorCode == "ERR_INVALID_URL")
    log(`Invalid URL! (${errorCode})`, "fetchError", true)
  else {
    log(JSON.stringify(error), "fetchError", true)
    response.redirect('/error')
  }
}






export function JSON_ParseError(rawDataString, resolve, measurementSource) {
  resolveEmptyArrays(resolve, measurementSource)
  log(`Error parsing JSON, rawDataString is equal to: ${rawDataString}`, "error", true)
}







export function resolveEmptyArrays(resolve, measurementSource) {

  const data = {}
  data[measurementSource] = [
    [],
    [],
    []
  ]
  resolve({ data })

}