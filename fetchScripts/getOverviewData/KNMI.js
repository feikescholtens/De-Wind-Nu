import fetch from "node-fetch"

export async function overviewFetchKNMI(locations, resolve) {

  let IDMatches = []
  locations.forEach(location => {
    if (Object.keys(location.datasets)[0] !== "KNMI") return

    IDMatches.push({
      applicationID: location.id,
      KNMI: location.datasets.KNMI.location_id,
    })
  })

  const rawDataString = await fetch("https://data.buienradar.nl/2.0/feed/json")
    .then(response => response.text())

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }

  let data = {}

  rawData.actual.stationmeasurements.forEach(locationData => {

    //Match reveived location with one from own list to get application ID for each location
    for (let i = 0; i < IDMatches.length; i++) {
      if (IDMatches[i].KNMI == locationData.stationid) {

        const wind_speed = locationData.windspeed * 1.94384449,
          wind_direction = locationData.winddirectiondegrees

        data[IDMatches[i].applicationID] = { wind_speed: wind_speed, wind_direction: wind_direction }

        break
      }
    }
  })

  resolve(data)
}