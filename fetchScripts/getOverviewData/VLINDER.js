import fetch from "node-fetch"
import { VLINDERerror } from "../fetchUtilFunctions.js"
import { parse } from "date-fns"

export async function overviewFetchVLINDER(locations, resolve) {

  const rawDataString = await fetch("https://mooncake.ugent.be/api/measurements").then(response => response.text())

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }
  if (VLINDERerror(rawData, resolve)) return

  let data = {}

  rawData.forEach(locationData => {

    //Match reveived location with one from own list to get application ID for each location
    for (const id in locations) {
      if (locations[id].VLINDER_ID) {

        if (locations[id].VLINDER_ID == locationData.id) {

          const windSpeed = locationData.windSpeed * 0.539956803,
            windGusts = locationData.windGust * 0.539956803,
            windDirection = locationData.windDirection,
            timeStamp = parse(locationData.time.substring(5, locationData.time.length - 4) + " Z", "dd MMM yyyy HH:mm:ss X", new Date()).toISOString()

          data[id] = {
            windSpeed: windSpeed,
            windGusts: windGusts,
            windDirection: windDirection,
            timeStamp: timeStamp
          }

          break
        }

      }
    }
  })

  resolve(data)
}