import { log } from "../../serverFunctions.js"
import { resolveEmptyArrays } from "../fetchUtilFunctions.js"

export function VLINDERerror(rawData, resolve) {
  if (rawData.error) {
    log(`VLINDER API error: \"${rawData.error}\"`, "error", true)
    resolveEmptyArrays(resolve, "VLINDER")
    return true
  }

  return false
}

export function JSONErrorVLINDER(rawData) {
  if (!rawData || !rawData.length) return true

  //All other errors (exept for when there's no data at all) are handled in logFetchErrors in serverFunctions.js
  if (rawData.error) {
    if (rawData.error == "not found") return false //This error is not handled here
  }
  return false
}