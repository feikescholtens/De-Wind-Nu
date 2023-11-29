import { subHours } from "date-fns"
import fetch from "node-fetch"
import { catchError, KNMIerror } from "../fetchUtilFunctions.js"

export async function overviewFetchKNMI(locations, resolve) {
  const date = subHours(new Date(), 3).toISOString() //Look for measurements from the last 3 hours,
  //can be reduced to 1 hour if works well

  const rawDataString = await fetch(`https://api.dataplatform.knmi.nl/edr/collections/observations/cube?datetime=${date}/..&parameter-name=ff_10m_10,fx_10m_10,dd_10`, { headers: { "Authorization": process.env.KDP_EDR_KEY } })
    .then(response => response.text()).catch((error) => catchError(resolve, {}, error, "KNMI"))
  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }
  if (KNMIerror(rawData, resolve)) return

  let data = {}

  rawData.coverages.forEach(locationData => {

    //Match reveived location with one from own list to get application ID for each location
    for (const id in locations) {
      if (locations[id].KNMI_ID) {
        //Match based on coordinates
        const lat = locationData.domain.axes.y.values[0]
        const lon = locationData.domain.axes.x.values[0]

        if (locations[id].KNMI_COORDS[0] == lat && locations[id].KNMI_COORDS[1] == lon) {
          const timeStampString = locationData.domain.axes.t.values.at(-1)
          const indexLastMeasurement = locationData.domain.axes.t.values.indexOf(timeStampString)

          const windSpeed = locationData.ranges.ff_10m_10.values[indexLastMeasurement] * 1.94384449,
            windGusts = locationData.ranges.fx_10m_10.values[indexLastMeasurement] * 1.94384449,
            windDirection = locationData.ranges.dd_10.values[indexLastMeasurement]

          data[id] = {
            windSpeed: windSpeed,
            windGusts: windGusts,
            windDirection: windDirection,
            timeStamp: timeStampString
          }

          break
        }

      }
    }

  })

  resolve(data)
}