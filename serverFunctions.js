export function validID(checkID, locations, response) {

  if (checkID !== "" && checkID.length == 4 && /^\d+$/.test(checkID) == true) {
    if (!locations[checkID]) {
      response.json({ errorCode: 400 })
      return false
    }
  } else {
    response.json({ errorCode: 400 })
    return false
  }
  return true

}

export async function generateId(locations) {

  //Gerenate random number
  let random = Math.random().toString().substring(2, 6)

  //Find that number in the database
  for (let i = 0; i < locations.length; i++) {
    if (locations.id == random) {
      generateId(locations)
      break;
    }
  }
  return random

}