import { readFileSync, writeFileSync } from "fs"

const locationsRaw = JSON.parse(readFileSync("Raw fetch results JSON/Locaties.json"))
const locations = []

locationsRaw.LocatieLijst.forEach(element => {
  locations.push({
    X: element.X,
    Y: element.Y,
    Code: element.Code
  })
})

writeFileSync("Script outputs/1. Extract locations.json", JSON.stringify(locations, null, 2))