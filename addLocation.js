import {
  writeFile
} from "fs";
import {
  generateId
} from "./generateId.js";

export async function addLocation(request, locations) {

  let new_location = request.body;

  const id = await generateId(locations);

  new_location.id = id;
  locations.push(new_location);

  writeFile("locations.json", JSON.stringify(locations, null, 2), (err) => {
    if (err) {
      console.log(err)
      return
    }

    console.log("Added new location to the list!")
  })
}