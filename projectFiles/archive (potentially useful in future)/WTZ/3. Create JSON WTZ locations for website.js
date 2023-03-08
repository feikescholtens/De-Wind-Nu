//Node script!

import { readFileSync, writeFileSync } from "fs"
import transformation from "transform-coordinates"

const SGLocations = JSON.parse(readFileSync("1. output.json"))
const allLocations = JSON.parse(readFileSync("2. output.json"))

const locationsObject = {}

const epsgRijksdriehoek = "28992"
const transform = transformation(`EPSG:${epsgRijksdriehoek}`, "4326")


for (const location in allLocations) {

  if (SGLocations.includes(location)) {
    const data = allLocations[location]

    if (data.CRS == "RD") {

      const lat = transform.forward({ x: data.X, y: data.Y }).y
      const lon = transform.forward({ x: data.X, y: data.Y }).x

      const name = data.description
      const ID = JSON.stringify(Math.random()).substring(2, 7)

      locationsObject[ID] = {
        lat: lat,
        lon: lon,
        name: name,
        datasets: {
          WTZ: {
            locations_id: location
          }
        }
      }

    }
  }


}

writeFileSync("3. output.json", JSON.stringify(locationsObject))