import { format, sub } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
import fetch from "node-fetch";
import { catchError, loopArrayRelativeIndex, lastMeasurementIndex } from "./fetchUtilFunctions.js"

const timeZone = 'Europe/Amsterdam'

export async function fetchRWS(databaseData, resolve, times) {

  let data = []

  const locationID = databaseData.datasets.Rijkswaterstaat.location_id
  const dateUTC = new Date()
  const dateZoned = utcToZonedTime(dateUTC, timeZone)
  const dateToday = format(dateZoned, "dd-MM-yyyy")
  const dateYesterdayFetch = format(sub(dateZoned, { days: 1 }), "yyyy-MM-dd")
  const dateTodayFetch = format(dateZoned, "yyyy-MM-dd")
  const time = "23:00:00"

  const rawDataString = await fetch(`https://waterberichtgeving.rws.nl/wbviewer/wb_api.php?request=windrose&meting=WN_S_1.2-5&verwachting=WN_knmi_6.1-2&loc=${locationID}&start=${dateYesterdayFetch}T${time}Z&end=${dateTodayFetch}T${time}Z`)
    .then(response => response.text()).catch((error) => catchError(resolve, data, error, "Rijkswaterstaat"))

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }

  const timeStamps = JSON.parse(JSON.stringify(times))
  let date = new Array(times.length).fill(dateToday),
    wind_speed = [],
    wind_gusts = [],
    wind_direction = [],
    wind_speedFOR = [],
    wind_directionFOR = []
  let dataCategorized = [],
    dataNullCounts = []
  const nullTreshold = 10
  const metingenCategoriesLength = rawData.meting.values[0].length
  const verwachtingenCategoriesLength = rawData.verwachting.values[0].length

  //Loop through # data categories
  for (let i = 0; i < (metingenCategoriesLength + verwachtingenCategoriesLength); i++) {

    dataCategorized.push([])
    dataNullCounts.push(0)

    //(the length of looparray is always the same as # of metingen, since they are filled with null arrays, this is more general)
    //(the relativeIndex needs to be determined though, because the array for verwachtingen is separate)
    const { loopArray, relativeIndex } = loopArrayRelativeIndex(i, metingenCategoriesLength, rawData)

    //Loop through every value of each category
    for (let j = 0; j < loopArray.length; j++) {
      dataCategorized[i].push(loopArray[j][relativeIndex])
    }

    dataCategorized[i].splice(lastMeasurementIndex(dataCategorized, i))

    //Loop for every category again to count nulls and replace null characters with negative value
    for (let j = 0; j < dataCategorized[i].length; j++) {
      if (!loopArray[i]) {
        dataNullCounts[i]++
        dataCategorized[i][j] = -999
      }
    }

    if (dataNullCounts[i] >= nullTreshold) return

    if (i == 2) wind_speed = dataCategorized[2].map(x => x / 10 * 1.94384449)
    if (i == 3) wind_gusts = dataCategorized[3].map(x => x / 10 * 1.94384449)
    if (i == 0) wind_direction = dataCategorized[0]
    if (i == 4) wind_speedFOR = dataCategorized[4].map(x => x / 10 * 1.94384449)
    if (i == 5) wind_directionFOR = dataCategorized[5]

  }

  data["Rijkswaterstaat"] = [date, timeStamps, wind_speed, wind_gusts, wind_direction, wind_speedFOR, wind_directionFOR]
  resolve({ data })

}