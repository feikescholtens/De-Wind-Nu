export function handleFetchErrors(dataFetched, response) {
  const errorCode = dataFetched.data.error.code;

  if (errorCode == "ENOTFOUND")
    response.redirect('/error?e=11');
  else if (errorCode == "ECONNRESET" || errorCode == "EPROTO")
    response.redirect('/error?e=76');
  else if (errorCode == "ETIMEDOUT")
    response.redirect('/error?e=99');
  else if (errorCode == 24)
    response.redirect('/error?e=24');
  else if (errorCode == 91)
    response.redirect('/error?e=14');
  else {
    console.log("An error occured: " + JSON.stringify(dataFetched))
    response.redirect('/error');
  }

}