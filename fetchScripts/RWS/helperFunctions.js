import { log } from "../../serverFunctions.js"
import { resolveEmptyArrays } from "../fetchUtilFunctions.js"

export function SuccesvolFalseError(rawData, resolve) {
  //All fetcherrors are handled in logFetchErrors in serverFunctions.js

  if (rawData.Foutmelding) log(`Rijkswaterstaat API "Succesvol"-error: ${rawData.Foutmelding}`, "error", true)

  if (!rawData.Succesvol) {
    resolveEmptyArrays(resolve, "RWS")
    return true
  }

  return false

}