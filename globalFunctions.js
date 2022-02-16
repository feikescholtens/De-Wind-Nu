import { format } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
const timeZone = "Europe/Amsterdam"

export function log(message, type = "debug", addCETDate) {
  let dateTime = format(utcToZonedTime(new Date(), timeZone), "dd-MM-yyyy HH:mm") + " (CET): "

  if (type == "debug") {
    if (addCETDate) {
      dateTime += message
      console.log("\x1b[94m%s\x1b[0m", dateTime)
    } else console.log("\x1b[94m%s\x1b[0m", message)
  }

  if (type == "error") {
    if (addCETDate) {
      dateTime += message
      console.log("\x1b[91m%s\x1b[0m", dateTime)
    } else console.log("\x1b[91m%s\x1b[0m", message)
  }

  if (type == "fetchError") {
    if (addCETDate) {
      dateTime += message
      console.log("\x1b[95m%s\x1b[0m", dateTime)
    } else console.log("\x1b[95m%s\x1b[0m", message)
  }

  if (type == "info") {
    if (addCETDate) {
      dateTime += message
      console.log("\x1b[93m%s\x1b[0m", dateTime)
    } else console.log("\x1b[93m%s\x1b[0m", message)
  }
}