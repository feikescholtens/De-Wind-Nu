import { format } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
const timeZone = "Europe/Amsterdam"

export function log(message, type = "debug", addLocalDate) {
  let dateTime = format(utcToZonedTime(new Date(), timeZone), "dd-MM-yyyy HH:mm") + " (CET/CEST): "

  if (type == "debug") {
    if (addLocalDate) {
      dateTime += message
      console.log("\x1b[94m%s\x1b[0m", dateTime)
    } else console.log("\x1b[94m%s\x1b[0m", message)
  }

  if (type == "error") {
    if (addLocalDate) {
      dateTime += message
      console.log("\x1b[91m%s\x1b[0m", dateTime)
    } else console.log("\x1b[91m%s\x1b[0m", message)
  }

  if (type == "fetchError") {
    if (addLocalDate) {
      dateTime += message
      console.log("\x1b[95m%s\x1b[0m", dateTime)
    } else console.log("\x1b[95m%s\x1b[0m", message)
  }

  if (type == "info") {
    if (addLocalDate) {
      dateTime += message
      console.log("\x1b[93m%s\x1b[0m", dateTime)
    } else console.log("\x1b[93m%s\x1b[0m", message)
  }
}