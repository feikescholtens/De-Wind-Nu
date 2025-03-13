import fetch from "node-fetch"
import { generateId } from "../../developmentFunctions.js"
import { readFileSync } from 'fs'

let locations = JSON.parse(readFileSync("../../locations.json"));

const data = await fetch("https://mooncake.ugent.be/api/stations").then(response => response.json())

for (let i = 0; i < data.length; i++) {
  let object = {
    id: await generateId(locations),
    name: `${data[i].city} ${data[i].given_name}`,
    lat: data[i].coordinates.latitude,
    lon: data[i].coordinates.longitude
  }
  object["datasets"] = {
    VLINDER: {
      location_id: data[i].id
    }
  }

  locations.push(object)
}

console.log(JSON.stringify(locations))