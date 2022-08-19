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