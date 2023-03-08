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

export function getLocationListParsingHarmonie(request, response, locations) {
  let locationsGCP = []
  const locationsArray = Object.entries(locations)
  for (let i = 0; i < locationsArray.length; i++) {
    locationsGCP.push({
      id: locationsArray[i][0],
      lat: parseFloat(parseFloat(locationsArray[i][1].lat).toFixed(4)),
      lon: parseFloat(parseFloat(locationsArray[i][1].lon).toFixed(4))
    })
  }
  response.json(locationsGCP)
}