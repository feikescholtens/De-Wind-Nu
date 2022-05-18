import fetch from "node-fetch"

export async function overviewFetchVLINDER(locations, resolve) {

  const rawDataString = await fetch("https://mooncake.ugent.be/api/measurements").then(response => response.text())

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }

  let data = {}

  rawData.forEach(locationData => {

    //Match reveived location with one from own list to get application ID for each location
    for (const id in locations) {
      if (locations[id].datasets.VLINDER) {

        if (locations[id].datasets.VLINDER.location_id == locationData.id) {

          const wind_speed = locationData.windSpeed * 0.539956803,
            wind_direction = locationData.windDirection

          data[id] = {
            wind_speed: wind_speed,
            wind_direction: wind_direction
          }

          break
        }

      }
    }
  })

  resolve(data)
}