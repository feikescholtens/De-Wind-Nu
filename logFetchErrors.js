import { format } from "date-fns"

export function logFetchErrors(dataFetched, response) {
  const errorCode = dataFetched.data.error.code
  const location = dataFetched.data.location

  if (errorCode == "ENOTFOUND")
    console.log(`${format(new Date(), "dd-MM-yyyy HH:mm")}: API endpoint ${dataFetched.data.dataset} doesn't exist, or there's a network error!`)
  else if (errorCode == "ECONNRESET" || errorCode == "EPROTO")
    console.log(`${format(new Date(), "dd-MM-yyyy HH:mm")}: Network problem reaching API!`)
  else if (errorCode == "ETIMEDOUT")
    console.log(`${format(new Date(), "dd-MM-yyyy HH:mm")}: Request timed out of API ${dataFetched.data.dataset}!`)
  else if (errorCode == "LOGINFAILED")
    console.log(`${format(new Date(), "dd-MM-yyyy HH:mm")}: Loggin in MVB API failed!`)
  else if (errorCode == "AUTHDENIED")
    console.log(`${format(new Date(), "dd-MM-yyyy HH:mm")}: Access denied accessing MVB API!`)
  else if (errorCode == "ENOMEASUREMENTS")
    console.log(`${format(new Date(), "dd-MM-yyyy HH:mm")}: Location "${location.name}" doesn't have any measurements!`)
  else {
    console.log("An error occured: " + JSON.stringify(dataFetched))
    response.redirect('/error');
  }

}