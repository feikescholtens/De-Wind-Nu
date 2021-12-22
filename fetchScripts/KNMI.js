import {
  format
} from "date-fns"
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

  await fetch(`https://graphdata.buienradar.nl/1.0/actualarchive/weatherstation/${locationID}/?startDate=${dateTodayFetch}`, {})
    .then(response => response.text())
    .then(function (raw_data_text) {

      const raw_data = JSON.parse(raw_data_text)

      let timeStamps = JSON.parse(JSON.stringify(times))

      //Declare variables
      let date = new Array(times.length).fill(dateToday),
        wind_speed = [],
        wind_gusts = [],
        wind_direction = []
      let null_counter = [0, 0, 0]
      const null_treshold = 5

      //Loop through the data
      for (var i = 0; i < raw_data.observations.length; i++) {

        //Check for wind, wind gusts and direction if the value is null, if so, add to the array which counts the null values
        if (raw_data.observations[i].values.ff == null) {
          null_counter[0]++
        }
        if (raw_data.observations[i].values.fx == null) {
          null_counter[1]++
        }
        if (raw_data.observations[i].values.dd == null) {
          null_counter[2]++
        }
      }

      //Loop for wind, wind gusts and direction (3 times, length of array null_counter)
      for (let k = 0; k < null_counter.length; k++) {

        //If the there are less null values in each array, good. Else the data is not considered good enough and the array remains empty
        if (null_counter[k] < null_treshold) {

          //Loop through all the data and add to the arrays (*0.53 for the factor to knots)
          for (let i = 0; i < raw_data.observations.length; i++) {
            if (k == 0) {
              wind_speed[i] = raw_data.observations[i].values.ff * 0.53995726994149
            }
            if (k == 1) {
              wind_gusts[i] = raw_data.observations[i].values.fx * 0.53995726994149
            }
            if (k == 2) {
              wind_direction[i] = raw_data.observations[i].values.dd
            }
          }
        }
      }

      timeStamps.splice(wind_speed.length)

      //Add all the data to the main array which will be returned
      data["KNMI"] = [date, timeStamps, wind_speed, wind_gusts, wind_direction]
      resolve({
        data
      })
      //Errors: will be sent back and handled in other function (handleFetchErrors)
    }).catch(function (error) {
      data = {
        error: error,
        dataset: "KNMI"
      }
      resolve({
        data
      })
    })
}