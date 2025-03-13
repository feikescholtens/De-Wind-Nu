import { log } from "../../serverFunctions.js"
import { resolveEmptyArrays } from "../fetchUtilFunctions.js"

export function KNMIerror(rawData, resolve) {
  //Both used for overviewdata as data, overviewdata gives "detail" field in returned JSON, data gives "error" field in returned JSON

  if (rawData.error || rawData.detail) {
    log(`KNMI API error: \"${JSON.stringify(rawData.error) || JSON.stringify(rawData.detail)}\"`, "error", true)
    resolveEmptyArrays(resolve, "KNMI")
    return true
  }

  return false
}