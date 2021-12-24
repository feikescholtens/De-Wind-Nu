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

  if (dataFetched.data[dataset][2].length == 0 && dataFetched.data[dataset][3].length == 0 && dataFetched.data[dataset][4].length == 0) {
    response.redirect('/error?e=14');
    return false
  }
  return true

}