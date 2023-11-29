import { readFileSync, writeFileSync } from "fs"

//Make backup of locations.json file
const allLocations = readFileSync("../../locations.json")
writeFileSync("../../locations.backup.json", allLocations)

//Parse data
const allLocationsJSON = JSON.parse(readFileSync("../../locations.json"))

for (let i = 0; i < Object.keys(allLocationsJSON).length; i++) {
  if (Object.values(allLocationsJSON)[i].RWS_ID) {
    const app_ID = Object.keys(allLocationsJSON)[i]

    const x = Object.values(allLocationsJSON)[i].x
    const y = Object.values(allLocationsJSON)[i].y

    allLocationsJSON[app_ID].RWS_COORDS = [x, y]
    delete allLocationsJSON[app_ID].x
    delete allLocationsJSON[app_ID].y
  }
}

writeFileSync("../../locations.json", JSON.stringify(allLocationsJSON, null, 2))