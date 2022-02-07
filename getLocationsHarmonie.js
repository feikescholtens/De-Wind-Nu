import { readFileSync } from "fs"

const locations = JSON.parse(readFileSync("locations.json"))
let locationsFetch = []

for (let i = 0; i < locations.length; i++) {

  locationsFetch.push({
    id: locations[i].id,
    lat: parseFloat(parseFloat(locations[i].lat).toFixed(4)),
    lon: parseFloat(parseFloat(locations[i].lon).toFixed(4))
  })
}

console.log(locationsFetch)