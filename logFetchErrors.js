import { format } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
const timeZone = "Europe/Amsterdam"

export function logFetchErrors(dataFetched, response) {
  const errorCode = dataFetched.data.error.code
  const location = dataFetched.data.location
  const dateTime = format(utcToZonedTime(new Date(), timeZone), "dd-MM-yyyy HH:mm")

  if (errorCode == "ENOTFOUND")
    console.log(`${dateTime}: API endpoint ${dataFetched.data.dataset} doesn't exist, or there's a network error!`)
  else if (errorCode == "ECONNRESET" || errorCode == "EPROTO")
    console.log(`${dateTime}:  Network problem reaching API!`)
  else if (errorCode == "ETIMEDOUT")
    console.log(`${dateTime}: Request timed out of API ${dataFetched.data.dataset}!`)
  else if (errorCode == "LOGINFAILED")
    console.log(`${dateTime}: Loggin in MVB API failed!`)
  else if (errorCode == "AUTHDENIED")
    console.log(`${dateTime}: Access denied accessing MVB API!`)
  else if (errorCode == "ENOMEASUREMENTS")
    console.log(`${dateTime}: Location "${location.name}" doesn't have any measurements!`)
  else {
    console.log(`${dateTime}: ${JSON.stringify(dataFetched)}`)
    response.redirect('/error');
  }

}