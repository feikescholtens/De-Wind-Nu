export function validID(checkID, locations, response) {

  if (checkID !== "" && checkID.length == 4 && /^\d+$/.test(checkID) == true) {
    if (!locations.find(location => location.id == checkID)) {
      response.redirect('/error?e=47');
      return false
    }
  } else {
    response.redirect('/error?e=47');
    return false
  }
  return true

}

export function dataUseful(dataFetched, dataset, response) {

  //Check if the times or dates array is empty, that means there are no measurements
  if (dataFetched.data[dataset][0].length == 0 || dataFetched.data[dataset][1].length == 0) {
    response.redirect('/error?e=14');
    return false

    //If that's not the case check if wind speed, wind gusts and wind direction are empty, this makes the data useless so send back an error
  } else if (dataFetched.data[dataset][2].length == 0 && dataFetched.data[dataset][3].length == 0 && dataFetched.data[dataset][4].length == 0) {
    response.redirect('/error?e=80');
    return false
  }
  return true

}