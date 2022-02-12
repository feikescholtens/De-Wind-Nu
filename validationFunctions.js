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