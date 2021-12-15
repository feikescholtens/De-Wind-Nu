function handleFetchErrors(data_fetched, response) {
  const error_code = data_fetched.data.error.code;
  //Check in which dataset the error occured
  if (data_fetched.data.dataset == "Rijkswaterstaat") {

    //If the error is that the fetch link was not found, send that to the frondend
    if (error_code == "ENOTFOUND") {
      response.json({
        error: "11"
      });

      //Server connection error to API
    } else if (error_code == "ECONNRESET" || error_code == "EPROTO") {
      response.json({
        error: "76"
      });

      //Other errors are not yet indexed, so this will throw 'unknown error'
    } else if (error_code == "ETIMEDOUT") {
      response.json({
        error: "99"
      });

      //Other errors are not yet indexed, so this will throw 'unknown error'
    } else {
      console.log("An error occured: " + JSON.stringify(data_fetched));

      response.json({
        error: ""
      });
    }

  } else if (data_fetched.data.dataset == "KNMI") {
    //If the error is that the fetch link was not found, send that to the frondend
    if (error_code == "ENOTFOUND") {
      response.json({
        error: "55"
      });

      //Server connection error to API
    } else if (error_code == "ECONNRESET" || error_code == "EPROTO") {
      response.json({
        error: "05"
      });

      //Other errors are not yet indexed, so this will throw 'unknown error'
    } else if (error_code == "ETIMEDOUT") {
      response.json({
        error: "25"
      });

      //Other errors are not yet indexed, so this will throw 'unknown error'
    } else {
      console.log("An error occured: " + JSON.stringify(data_fetched));

      response.json({
        error: ""
      });
    }
  } else if (data_fetched.data.dataset == "MVB") {
    //If the error is that the fetch link was not found, send that to the frondend
    if (error_code == "ENOTFOUND") {
      response.json({
        error: "79"
      });

      //Server connection error to API
    } else if (error_code == "ECONNRESET" || error_code == "EPROTO") {
      response.json({
        error: "22"
      });

      //Other errors are not yet indexed, so this will throw 'unknown error'
    } else if (error_code == "LOGINFAILED") {
      response.json({
        error: "57"
      });

      //Other errors are not yet indexed, so this will throw 'unknown error'
    } else if (error_code == "ETIMEDOUT") {
      response.json({
        error: "58"
      });

      //Other errors are not yet indexed, so this will throw 'unknown error'
    } else {
      console.log("An error occured: " + JSON.stringify(data_fetched));

      response.json({
        error: ""
      });
    }
  }
}

//Export the function to the fetchData file
module.exports = {
  handleFetchErrors
};