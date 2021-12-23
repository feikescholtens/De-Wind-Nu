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

  console.log(rawData.meting.values[rawData.meting.values.length - 5])

  //Declare variables
  let date = new Array(times.length).fill(dateToday),
    wind_speed = [],
    wind_gusts = [],
    wind_direction = [],
    wind_speedFOR = [],
    wind_directionFOR = []
  let null_counter = [0, 0, 0]
  const null_treshold = 5
  let iLastMeasurement

  for (iLastMeasurement = rawData.meting.values.length - 1; iLastMeasurement >= 0; iLastMeasurement--) {
    if (rawData.meting.values[iLastMeasurement][0] !== null) {
      iLastMeasurement++
      break
    }
  }

  //Loop again but this time only through the values that are defined
  for (let i = 0; i < iLastMeasurement; i++) {

    //Check for wind, wind gusts and direction if the value is null, if so, add to the array which counts the null values
    if (rawData.meting.values[i][2] == null) {
      null_counter[0]++
    }
    if (rawData.meting.values[i][3] == null) {
      null_counter[1]++
    }
    if (rawData.meting.values[i][0] == null) {
      null_counter[2]++
    }
  }

  //Loop for wind, wind gusts and direction (3 times, length of array null_counter)
  for (let k = 0; k < null_counter.length; k++) {

    //If the there are less null values in each array, good. Else the data is not considered good enough and the array remains empty
    if (null_counter[k] < null_treshold) {

      //Loop through all the data and add to the arrays (*10 for the right decimals place and *1.94 for the factor to knots)
      for (let i = 0; i < iLastMeasurement; i++) {
        if (k == 0) {

          //If value is null, set it in the array as the previous value
          if (rawData.meting.values[i][2] == null) {
            if (wind_speed[i - 1]) {
              wind_speed[i] = wind_speed[i - 1]
            } else {
              wind_speed[i] = ""
            }
          } else {
            wind_speed[i] = (rawData.meting.values[i][2] / 10 * 1.94384449)
          }
        }
        if (k == 1) {

          //If value is null, set it in the array as the previous value
          if (rawData.meting.values[i][3] == null) {
            if (wind_gusts[i - 1]) {
              wind_gusts[i] = wind_speed[i - 1]
            } else {
              wind_gusts[i] = ""
            }
          } else {
            wind_gusts[i] = (rawData.meting.values[i][3] / 10 * 1.94384449)
          }
        }
        if (k == 2) {

          //If value is null, set it in the array as the previous value
          if (rawData.meting.values[i][0] == null) {
            if (wind_direction[i - 1]) {
              wind_direction[i] = wind_speed[i - 1]
            } else {
              wind_direction[i] = ""
            }
          } else {
            wind_direction[i] = rawData.meting.values[i][0]
          }
        }
      }
    }
  }

  //Loop through all the values in the verwachtingen key, these will most likely be not equal to null
  for (let l = 0; l < rawData.verwachting.values.length; l++) {

    //Add date for every timestamp of the day to the date array
    date[l] = dateToday

    //Wind Speed
    if (rawData.verwachting.values[l][0] !== null) {
      wind_speedFOR[l] = rawData.verwachting.values[l][0] / 10 * 1.94384449
    } else if (wind_speedFOR[l - 1]) {
      wind_speedFOR[l] = wind_speedFOR[l - 1]
    } else {
      wind_speedFOR[l] = ""
    }

    //Wind Direction
    if (rawData.verwachting.values[l][1] !== null) {
      wind_directionFOR[l] = rawData.verwachting.values[l][1]
    } else if (wind_directionFOR[l - 1]) {
      wind_directionFOR[l] = wind_directionFOR[l - 1]
    } else {
      wind_directionFOR[l] = ""
    }
  }

  let timeStamps = JSON.parse(JSON.stringify(times))
  timeStamps.splice(wind_speed.length)

  //Add all the data to the main array which will be returned
  data["Rijkswaterstaat"] = [date, timeStamps, wind_speed, wind_gusts, wind_direction, wind_speedFOR, wind_directionFOR]
  resolve({
    data
  })


}