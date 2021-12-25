import { readFile, readFileSync } from "fs";

const locations = JSON.parse(readFileSync("locations.json"))

locations.forEach((location) => {
  if (location.datasets.Rijkswaterstaat) {
    console.log(location.name)
  }
})