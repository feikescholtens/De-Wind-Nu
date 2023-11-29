//Motivation: this script takes all locations that currently give data (as long as No. measurements today	>> 0)
//in the KNMI EDR API. It also gives a yes or no in the 'Currently in use as KNMI location' column.
//If there is a no for this value, research if this location can be used with the EDR API instead of the RWS one,
//since the EDR API is far superior.

//Open the table.html file for the result

import fetch from "node-fetch"
const dotenv = await import("dotenv")
dotenv.config({ path: "../../.env" })
import { readFileSync, writeFileSync } from "fs"
import { startOfDay } from "date-fns"

const apiKey = process.env.KDP_EDR_KEY

const locations = Object.fromEntries(Object.entries(JSON.parse(readFileSync("../../locations.json"))).filter(([key, value]) => value.active))
const data = await fetch("https://api.dataplatform.knmi.nl/edr/collections/observations/locations", { headers: { "Authorization": apiKey } }).then(response => response.json())

const dateTodayStart = startOfDay(new Date()).toISOString()

const table = [
  ["ID", "Name", "No. measurements today", "Currently in use as KNMI location", "lat", "lon"]
]

for (let i = 0; i < data.features.length; i++) {
  const row = []

  const lon = data.features[i].geometry.coordinates[0]
  const lat = data.features[i].geometry.coordinates[1]
  const locationID = data.features[i].id
  const locationName = data.features[i].properties.name

  console.log(lon, lat)
  const dataLocation = await fetch(`https://api.dataplatform.knmi.nl/edr/collections/observations/position?coords=POINT(${lon} ${lat})&datetime=${dateTodayStart}/..&parameter-name=ff_10m_10,fx_10m_10,dd_10`, { headers: { "Authorization": apiKey } }).then(response => response.json())

  row.push(locationID)
  row.push(locationName)
  if (dataLocation.detail) row.push(`0, KNMI API: ${dataLocation.detail}`)
  else row.push(dataLocation.domain.axes.t.values.length)



  // if (dataLocation.domain.axes.t.values.length === 0)
  const keyInLocationsIfExistant = Object.keys(locations).find(key => {
    if (locations[key].KNMI_ID == locationID) {
      return true
    } else return false
  })

  if (keyInLocationsIfExistant) row.push("yes")
  else row.push("no")

  row.push(lat)
  row.push(lon)

  table.push(row)
}


writeFileSync("table.html", JSON.stringify(makeTableHTML(table)))




function makeTableHTML(myArray) {
  var result = "<table border=1>";
  for (var i = 0; i < myArray.length; i++) {
    result += "<tr>";
    for (var j = 0; j < myArray[i].length; j++) {
      result += "<td>" + myArray[i][j] + "</td>";
    }
    result += "</tr>";
  }
  result += "</table>";

  return result;
}