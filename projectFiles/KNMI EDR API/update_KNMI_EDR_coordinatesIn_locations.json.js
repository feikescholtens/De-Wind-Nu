//Motivation: this script is used to update the coordinates of all the KNMI locations in the 
//main locations.json file. This is needed because the overview data for the EDR API of the KNMI
//can only be requested with coordinates, not with locations ID's.
//With the coordinates of these locations in the locations.json file, in the fetchscript, the
//returned can be matched with the coorninates to result in an ID, which is actually useful

import fetch from "node-fetch"
const dotenv = await import("dotenv")
dotenv.config({ path: "../../.env" })
import { readFileSync, writeFileSync } from "fs"

//Make backup of locations.json file
const allLocations = readFileSync("../../locations.json")
writeFileSync("../../locations.backup.json", allLocations)

//Fetch all location data EDR API
const apiKey = process.env.KDP_EDR_KEY
const data = await fetch("https://api.dataplatform.knmi.nl/edr/v1/collections/observations/locations", { headers: { "Authorization": apiKey } }).then(response => response.json())
console.log(data)

//Parse data
const allLocationsJSON = JSON.parse(readFileSync("../../locations.json"))

const activeKNMILocations = Object.fromEntries(Object.entries(JSON.parse(readFileSync("../../locations.json"))).filter(([key, value]) => value.active).filter(([key, value]) => value.KNMI_ID))
for (let i = 0; i < Object.keys(activeKNMILocations).length; i++) {

  const locationID = Object.keys(activeKNMILocations)[i]
  console.log("Internal ID found match: ", Object.keys(activeKNMILocations)[i])
  const foundLocations = data.features.filter((item) => {
    return item.id === Object.values(activeKNMILocations)[i].KNMI_ID
  })

  //Update fields in main JSON file
  foundLocations[0].geometry.coordinates.pop()
  allLocationsJSON[locationID].KNMI_COORDS = foundLocations[0].geometry.coordinates.reverse()

}

writeFileSync("../../locations.json", JSON.stringify(allLocationsJSON, null, 2))