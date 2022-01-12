import { existsSync, readFileSync, writeFileSync } from "fs"
import fetch from "node-fetch"
import { format, sub } from "date-fns"

const locations = JSON.parse(readFileSync("Script outputs/1. Extract locations.json"))
let locationsWithWindData = []
const dateToday = format(new Date(), "yyyy-MM-dd")
const date1YearAgo = format(sub(new Date(), { years: 1 }), "yyyy-MM-dd")
const parametersCheck = ["WINDSHD", "WS10", "WINDRTG", "WINDSTOOT"]

const start = 3001,
  stop = 3201;
//Includes stop index

if (existsSync("Script outputs/2. Check and save locations with wind data.json")) {
  locationsWithWindData = JSON.parse(readFileSync("Script outputs/2. Check and save locations with wind data.json"))
}

(async () => {
  for (let j = start; j <= stop; j++) {
    if (j >= locations.length - 1) return

    let availableData = []
    console.log(`-----------------${locations[j].name}, ${j}----------------------"`)

    for (let i = 0; i < parametersCheck.length; i++) {

      console.log(`• ${parametersCheck[i]}`)
      const response = await fetch("https://waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGENSERVICES_DBO/CheckWaarnemingenAanwezig", {
        "method": "POST",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },

        "body": JSON.stringify({
          "AquoMetadataLijst": [{
            "Compartiment": {
              "Code": "LT"
            },
            "Grootheid": {
              "Code": "WINDSHD"
            }
          }],
          "LocatieLijst": [{
            "X": locations[j].x,
            "Y": locations[j].y,
            "Code": locations[j].id
          }],
          "Periode": {
            "Begindatumtijd": `${date1YearAgo}T00:00:00.000+01:00`,
            "Einddatumtijd": `${dateToday}T00:00:00.000+01:00`
          }
        })

      })

      const data = await response.json()
      if (JSON.parse(data.WaarnemingenAanwezig.toLowerCase())) {
        console.log('\x1b[32m%s\x1b[0m', 'available')
        availableData.push(parametersCheck[i])
      } else {
        console.log('\x1b[31m%s\x1b[0m', 'unavailable')
      }

    }

    let pushObject = {}
    pushObject[locations[j].id] = availableData
    if (availableData.length !== 0) locationsWithWindData.push(pushObject)
  }

  writeFileSync("Script outputs/2. Check and save locations with wind data.json", JSON.stringify(locationsWithWindData, null, 2))
})()