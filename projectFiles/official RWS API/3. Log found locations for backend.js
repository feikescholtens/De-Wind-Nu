import { existsSync, readFileSync, writeFileSync } from "fs"
import transformation from "transform-coordinates"
import { generateId } from "../../serverFunctions.js"

const transform = transformation("EPSG:25831", "4326")
const existingLocations = JSON.parse(readFileSync("../../locations.json"))

if (existsSync("Script outputs/2. Check and save locations with wind data.json") && existsSync("Script outputs/1. Extract locations.json")) {
  const locationsWithWindData = JSON.parse(readFileSync("Script outputs/2. Check and save locations with wind data.json"))
  const locations = JSON.parse(readFileSync("Script outputs/1. Extract locations.json"))


  let locationsFormatted = []

  for (let i = 0; i < locationsWithWindData.length; i++) {

    const IDlocationsWithWindData = Object.keys(locationsWithWindData[i])[0]

    for (let j = 0; j < locations.length; j++) {
      const ID = locations[j].id

      if (IDlocationsWithWindData == ID) {

        locationsFormatted.push({
          id: await generateId(existingLocations),
          name: locations[j].name,
          lat: transform.forward({ x: locations[j].x, y: locations[j].y }).y,
          lon: transform.forward({ x: locations[j].x, y: locations[j].y }).x,
          x: locations[j].x,
          y: locations[j].y,
          datasets: {
            RWS_OFFICIAL: {
              location_id: locations[j].id
            }
          }
        })

      }
    }
  }
  writeFileSync("Script outputs/3. Log found locations for backend.json", JSON.stringify(locationsFormatted, null, 2))
}