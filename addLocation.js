import { writeFile } from "fs"
import { generateId } from "./serverFunctions.js"

export async function addLocation(request, locations) {

  let newLocation = request.body

  const id = await generateId(locations)

  newLocation.id = id
  locations.push(newLocation)

  writeFile("locations.json", JSON.stringify(locations, null, 2), error => {
    if (error) {
      console.log(error)
      return
    }

    console.log("Added new location to the list!")
  })
}