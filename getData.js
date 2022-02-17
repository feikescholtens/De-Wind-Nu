import { logFetchErrors } from "./logFetchErrors.js"
import { validID } from "./validationFunctions.js"
import { readFileSync } from 'fs'
import { fetchRWS } from "./fetchScripts/getData/Rijkswaterstaat.js"
import { fetchKNMI } from "./fetchScripts/getData/KNMI.js"
import { fetchMVB } from "./fetchScripts/getData/MVB.js"
import { calcInterpolation } from "./getScriptUtilFunctions.js"
import { format, add, parseISO } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"

const timeZone = "Europe/Amsterdam"
const times = JSON.parse(readFileSync("times.json"))

export async function getData(request, response, locations, forecastData) {
  if (!validID(request.params.id, locations, response)) return

  const location = locations.find(location => location.id == request.params.id)
  const dataset = Object.keys(location.datasets)[0]
  let values = []

  //Date and times 
  const dateUTC = new Date()
  const dateZoned = utcToZonedTime(dateUTC, timeZone)
  const dateToday = format(dateZoned, "dd-MM-yyyy")
  values.push(new Array(times.length).fill(dateToday))
  values.push(times)

  //Measurements
  const dataFetched = await new Promise(async (resolve) => {
    // Rijkswaterstaat
    if (location.datasets.Rijkswaterstaat) {
      return fetchRWS(location, resolve, times)
    }
    //KNMI
    if (location.datasets.KNMI) {
      return fetchKNMI(location, resolve, times)
    }
    //Meetnet Vlaamse Banken
    if (location.datasets.MVB) {
      return fetchMVB(location, resolve, times)
    }
  })

  if (dataFetched.data.error) {
    logFetchErrors(dataFetched, response)
    for (let i = 0; i < 3; i++) values.push([])
  } else
    for (let i = 0; i < 3; i++) values.push(dataFetched.data[dataset][i])

  //Forecast
  if (forecastData[location.id]) {
    const startForecastTime = forecastData[location.id][0].time
    const startForecastTimeIndex = times.indexOf(startForecastTime)

    let wind_forecast = new Array(times.length),
      wind_forecastGust = new Array(times.length),
      wind_forecastDirection = new Array(times.length)

    const indexFirstForecastTimeToday = forecastData[Object.keys(forecastData)[0]].findIndex(location => location.date == dateToday)
    const amountHourValues = forecastData[location.id].length - indexFirstForecastTimeToday

    for (let i = 0; i < amountHourValues; i++) {
      wind_forecast[startForecastTimeIndex + i * 6] = forecastData[location.id][i + indexFirstForecastTimeToday].s
      wind_forecastDirection[startForecastTimeIndex + i * 6] = forecastData[location.id][i + indexFirstForecastTimeToday].d
      wind_forecastGust[startForecastTimeIndex + i * 6] = forecastData[location.id][i + indexFirstForecastTimeToday].g
    }

    values.push(calcInterpolation(wind_forecast, times, startForecastTimeIndex))
    values.push(calcInterpolation(wind_forecastDirection, times, startForecastTimeIndex))
    values.push(calcInterpolation(wind_forecastGust, times, startForecastTimeIndex))
  }

  const timeStampRun = utcToZonedTime(parseISO(`${forecastData.timeRun}Z`), timeZone)
  const timeRun = format(timeStampRun, "HH:mm")
  const timeNextRun = format(add(timeStampRun, { hours: (2 + 6), minutes: 58 }), "HH:mm")

  //Rest of the errors are logged/handled in logFetchErrors.js
  if (values[2].length == 0 && values[3].length == 0 && values[4].length == 0 && values[5]) {
    log(`Location "${location.name}" doesn't have any measurements!`, "fetchError", true)
  }
  if (values[2].length == 0 && values[3].length == 0 && values[4].length == 0 && !values[5]) {
    log(`Location "${location.name}" doesn't have any data (neither measurements nor forecast)!`, "fetchError", true)
    response.redirect('/error?e=14')
  }

  return {
    values: values,
    spotName: location.name,
    dataset: dataset,
    forecastRun: timeRun,
    nextForecastRun: timeNextRun
  }
}