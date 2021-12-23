import { format, sub } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
import fetch from "node-fetch";

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
    .then(response => response.text()).catch(function(error) {
      data = { error: error, dataset: "Rijkswaterstaat" }
      resolve({ data })
    })

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }

  const timeStamps = JSON.parse(JSON.stringify(times))
  let date = new Array(times.length).fill(dateToday),
    wind_speed = [],
    wind_gusts = [],
    wind_direction = [],
    wind_speedFOR = [],
    wind_directionFOR = []
  let dataCategorized = []
  let dataNullCounts = {}
  const nullTreshold = 20

  //Loop through data category (wind, gusts, direction)
  for (let i = 0; i < rawData.meting.values[0].length; i++) {

    dataCategorized[i] = []
    dataNullCounts[i] = 0

    //Loop for every category through the amount of measurements
    for (let j = 0; j < rawData.meting.values.length; j++) {

      dataCategorized[i].push(rawData.meting.values[j][i])
      if (!rawData.meting.values[j][i]) {
        dataNullCounts[i]++
        rawData.meting.values[j][i] = -999
      }
    }




    if (dataNullCounts[i] >= nullTreshold) return

    if (i == 2) {


      // const lastMeasurement = dataCategorized[i].reverse().find(measurement => measurement != null)
      // const lastMeasurementIndex = dataCategorized[i].indexOf(lastMeasurement, -1)
      // dataCategorized[i].splice(lastMeasurementIndex + 1)
      // console.log(lastMeasurement / 10 * 1.94384449)
      // console.log(dataCategorized[i].reverse())
      // console.log(lastMeasurementIndex)
      // console.log(dataCategorized[i][lastMeasurementIndex])

      //testing above functions, they should work, move outside if statement, so do for all measurement types

      //forecast in the same way

      //fix errors not showing (page is timing out)

      wind_speed = dataCategorized[2].map(x => x / 10 * 1.94384449)
    }
    if (i == 3) wind_gusts = dataCategorized[3].map(x => x / 10 * 1.94384449)
    if (i == 0) wind_direction = dataCategorized[0]

  }


  //Add all the data to the main array which will be returned
  data["Rijkswaterstaat"] = [date, timeStamps, wind_speed, wind_gusts, wind_direction]
  resolve({ data })

}