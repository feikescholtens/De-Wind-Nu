export function validID(checkID, locations, response) {

  if (checkID !== "" && checkID.length == 4 && /^\d+$/.test(checkID) == true) {
    if (!locations.find(location => location.id == checkID)) {
      response.json({ errorCode: 400 })
      return false
    }
  } else {
    response.json({ errorCode: 400 })
    return false
  }
  return true

}

export function getFrontEndErrorMessage(request, frontEndErrorMessages) {

  const errorId = request.params.errorId
  let errorMessage
  const knownErrors = Object.keys(frontEndErrorMessages)

  if (!errorId) return { errorMessage: `Er is een onbekende fout opgetreden!` }
  if (knownErrors.includes(errorId)) {
    errorMessage = `Er is een fout opgetreden (error ${errorId}): ${frontEndErrorMessages[errorId]}`
  } else if (errorId[0] == 5)
    errorMessage = `Er is een fout opgetreden (error ${errorId}): Server fout`
  else {
    errorMessage = `Er is een onbekende fout opgetreden!`
  }

  return { errorMessage: errorMessage }

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