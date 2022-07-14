import fetch from "node-fetch"
import { parseISO } from "date-fns"

export async function overviewFetchKNMI(locations, resolve) {

  let IDMatches = []
  for (const id in locations) {
    if (Object.keys(locations[id].datasets)[0] == "KNMI") {
      IDMatches.push({
        applicationID: id,
        KNMI: locations[id].datasets.KNMI.location_id,
      })
    }
  }

  const rawDataString = await fetch("https://data.buienradar.nl/2.0/feed/json")
    .then(response => response.text())

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }

  let data = {}

  rawData.actual.stationmeasurements.forEach(locationData => {

    //Match reveived location with one from own list to get application ID for each location
    for (let i = 0; i < IDMatches.length; i++) {
      if (IDMatches[i].KNMI == locationData.stationid) {

        const windSpeed = locationData.windspeed * 1.94384449,
          windGusts = locationData.windgusts * 1.94384449,
          windDirection = locationData.winddirectiondegrees,
          timeStamp = parseISO(locationData.timestamp).toISOString()

        data[IDMatches[i].applicationID] = { windSpeed: windSpeed, windGusts: windGusts, windDirection: windDirection, timeStamp: timeStamp }

        break
      }
    }
  })

  resolve(data)
}