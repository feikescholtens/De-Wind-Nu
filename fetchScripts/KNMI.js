import { format } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
import fetch from "node-fetch";
import { catchError } from "./fetchUtilFunctions.js"
const timeZone = 'Europe/Amsterdam'

export async function fetchKNMI(databaseData, resolve, times) {

  let data = []

  const locationID = databaseData.datasets.KNMI.location_id
  const dateUTC = new Date()
  const dateZoned = utcToZonedTime(dateUTC, timeZone)
  const dateToday = format(dateZoned, "dd-MM-yyyy")
  const dateTodayFetch = format(dateZoned, "yyyy-M-d")

  const rawDataString = await fetch(`https://graphdata.buienradar.nl/1.0/actualarchive/weatherstation/${locationID}/?startDate=${dateTodayFetch}`)
    .then(response => response.text()).catch((error) => catchError(resolve, data, error, "KNMI"))

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }

  const timeStamps = JSON.parse(JSON.stringify(times))
  let date = new Array(times.length).fill(dateToday),
    wind_speed = [],
    wind_gusts = [],
    wind_direction = []
  let dataCategorized = {}
  let dataNullCounts = {}
  const nullTreshold = 10

  Object.keys(rawData.observations[0].values).forEach(measurementType => {
    if (!["ff", "fx", "dd"].includes(measurementType)) return

    dataCategorized[measurementType] = []
    dataNullCounts[measurementType] = 0

    rawData.observations.forEach(measurement => {
      if (!measurement.values[measurementType]) {

        dataNullCounts[measurementType]++
        dataCategorized[measurementType].push(-999)
      } else dataCategorized[measurementType].push(measurement.values[measurementType])
    })

    if (dataNullCounts[measurementType] >= nullTreshold) return

    if (measurementType == "ff") {
      wind_speed = dataCategorized[measurementType].map(x => x * 0.53995726994149)
    } else if (measurementType == "fx") {
      wind_gusts = dataCategorized[measurementType].map(x => x * 0.53995726994149)
    } else if (measurementType == "dd") {
      wind_direction = dataCategorized[measurementType]
    }
  })

  timeStamps.splice(wind_speed.length)

  data["KNMI"] = [date, timeStamps, wind_speed, wind_gusts, wind_direction]
  resolve({ data })
}