export function logFetchErrors(dataFetched, response) {
  const errorCode = dataFetched.data.error.code

  if (errorCode == "ENOTFOUND")
    log(`API endpoint ${dataFetched.data.dataset} doesn't exist, or there's a network error!`, "fetchError")
  else if (errorCode == "ECONNRESET" || errorCode == "EPROTO")
    log(`Network problem reaching API!`, "fetchError")
  else if (errorCode == "ETIMEDOUT")
    log(`Request timed out of API ${dataFetched.data.dataset}!`, "fetchError")
  else if (errorCode == "LOGINFAILED")
    log(`Loggin in MVB API failed!`, "fetchError")
  else if (errorCode == "AUTHDENIED")
    log(` Access denied accessing MVB API!`, "fetchError")
  else {
    log(JSON.stringify(dataFetched), "fetchError")
    response.redirect('/error')
  }

}