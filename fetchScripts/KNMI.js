import { format } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
import fetch from "node-fetch";
const timeZone = 'Europe/Amsterdam'

export async function fetchKNMI(databaseData, resolve, times) {

  let data = []

  const locationID = databaseData.datasets.KNMI.location_id
  const dateUTC = new Date()
  const dateZoned = utcToZonedTime(dateUTC, timeZone)
  const dateToday = format(dateZoned, "dd-MM-yyyy")
  const dateTodayFetch = format(dateZoned, "yyyy-M-d")

  const rawDataString = await fetch(`https://graphdata.buienradar.nl/1.0/actualarchive/weatherstation/${locationID}/?startDate=${dateTodayFetch}`)
    .then(response => response.text()).catch((error) => {
      data = { error: error, dataset: "KNMI" }
      resolve({ data })
    })

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }

  const timeStamps = JSON.parse(JSON.stringify(times))
  let date = new Array(times.length).fill(dateToday),
    wind_speed = [],
    wind_gusts = [],
    wind_direction = []
  let nullCounts = { ff: 0, fx: 0, dd: 0 }
  const nullTreshold = 10

  let dataCategorized = {}

  Object.keys(rawData.observations[0].values).forEach(measurementType => {
    dataCategorized[measurementType] = []

    rawData.observations.forEach(measurement => {
      dataCategorized[measurementType].push(measurement.values[measurementType])
    });
  })

  console.log(dataCategorized)

  //Loop through the data
  // rawData.observations.forEach(measurement => {

  //   Object.keys(measurement.values).forEach(measurementType => {
  //     console.log(measurementType)

  //     if (measurement.values[measurementType] == null) {
  //       nullCounts[measurementType]++
  //     }

  //   })

  // });

  // Object.keys(measurement.values).forEach(measurementType => {
  //   console.log(measurementType)

  //   if (measurement.values[measurementType] == null) {
  //     nullCounts[measurementType]++
  //   }

  // })
  // console.log(nullCounts)

  //Loop for wind, wind gusts and direction (3 times, length of array null_counter)
  // nullCounts.forEach((nullCount) => {
  //   //If the there are less null values in each array, good. Else the data is not considered good enough and the array remains empty
  //   if (nullCount < nullTreshold) {

  //     //Loop through all the data and add to the arrays (*0.53 for the factor to knots)
  //     for (let i = 0; i < rawData.observations.length; i++) {
  //       if (k == 0) {
  //         wind_speed[i] = rawData.observations[i].values.ff * 0.53995726994149
  //       }
  //       if (k == 1) {
  //         wind_gusts[i] = rawData.observations[i].values.fx * 0.53995726994149
  //       }
  //       if (k == 2) {
  //         wind_direction[i] = rawData.observations[i].values.dd
  //       }
  //     }
  //   }
  // })
  // for (let k = 0; k < null_counter.length; k++) {

  //   // //If the there are less null values in each array, good. Else the data is not considered good enough and the array remains empty
  //   // if (null_counter[k] < null_treshold) {

  //   //   //Loop through all the data and add to the arrays (*0.53 for the factor to knots)
  //   //   for (let i = 0; i < rawData.observations.length; i++) {
  //   //     if (k == 0) {
  //   //       wind_speed[i] = rawData.observations[i].values.ff * 0.53995726994149
  //   //     }
  //   //     if (k == 1) {
  //   //       wind_gusts[i] = rawData.observations[i].values.fx * 0.53995726994149
  //   //     }
  //   //     if (k == 2) {
  //   //       wind_direction[i] = rawData.observations[i].values.dd
  //   //     }
  //   //   }
  //   // }
  // }

  timeStamps.splice(wind_speed.length)

  //Add all the data to the main array which will be returned
  data["KNMI"] = [date, timeStamps, wind_speed, wind_gusts, wind_direction]
  resolve({ data })


}