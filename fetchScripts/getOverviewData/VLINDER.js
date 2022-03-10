import fetch from "node-fetch"

export async function overviewFetchVLINDER(locations, resolve) {

  const rawDataString = await fetch("https://mooncake.ugent.be/api/measurements").then(response => response.text())

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }

  let data = {}

  rawData.forEach(locationData => {

    //Match reveived location with one from own list to get application ID for each location
    for (let i = 0; i < locations.length; i++) {
      if (locations[i].datasets.VLINDER) {

        if (locations[i].datasets.VLINDER.location_id == locationData.id) {

          const wind_speed = locationData.windSpeed * 0.539956803,
            wind_direction = locationData.windDirection

          data[locations[i].id] = {
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