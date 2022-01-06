import { readFileSync, writeFileSync } from "fs"

const locationsRaw = JSON.parse(readFileSync("Raw fetch results JSON/Locaties.json"))
const locations = []

locationsRaw.LocatieLijst.forEach(element => {
  locations.push({
    x: element.X,
    y: element.Y,
    name: element.Naam,
    id: element.Code
  })
})

writeFileSync("Script outputs/1. Extract locations.json", JSON.stringify(locations, null, 2))