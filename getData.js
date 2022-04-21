import { logFetchErrors } from "./logFetchErrors.js"
import { validID } from "./serverFunctions.js"
import { fetchVLINDER } from "./fetchScripts/getData/VLINDER.js"
import { fetchRWS } from "./fetchScripts/getData/Rijkswaterstaat.js"
import { fetchKNMI } from "./fetchScripts/getData/KNMI.js"
import { fetchMVB } from "./fetchScripts/getData/MVB.js"
import { getTimeChangeDates, generateTimes, calcInterpolation, restartHerokuDynos } from "./getScriptUtilFunctions.js"
import { format, add, parseISO } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"

const timeZone = "Europe/Amsterdam"

export async function getData(request, response, locations, forecastData) {

  if (!validID(request.params.id, locations, response)) return

  const timeOutTimer = setTimeout(() => {
    response.status(5040).json()
    //Basically 504 error but this prevents CloudFlare from showing it's message
    if (port == 3000) return

    log("Restarting server due to timed out request!", "info", true)
    restartHerokuDynos()
  }, 29.5 * 1000)
  //Triggering timeout 1/2 a second before Heroku does

  const location = locations.find(location => location.id == request.params.id)
  const dataset = Object.keys(location.datasets)[0]
  let values = []

  //Date and times 
  let NoMeasurementsXHour
  if (["Rijkswaterstaat", "KNMI", "MVB"].includes(dataset)) NoMeasurementsXHour = 6
  if (["VLINDER"].includes(dataset)) NoMeasurementsXHour = 12
  let times
  const DSTDates = getTimeChangeDates()
  const dateToDST = format(utcToZonedTime(DSTDates[0], timeZone), "dd-MM")
  const dateFromDST = format(utcToZonedTime(DSTDates[1], timeZone), "dd-MM")
  const dateNow = format(utcToZonedTime(new Date(), timeZone), "dd-MM")
  if (dateNow == dateToDST) times = generateTimes(60 / NoMeasurementsXHour, "toDST")
  else if (dateNow == dateFromDST) times = generateTimes(60 / NoMeasurementsXHour, "fromDST")
  else times = generateTimes(60 / NoMeasurementsXHour)

  const dateUTC = new Date()
  const dateZoned = utcToZonedTime(dateUTC, timeZone)
  const dateToday = format(dateZoned, "dd-MM-yyyy")
  values.push(new Array(times.length).fill(dateToday))
  values.push(times)

  //Measurements
  const dataFetched = await new Promise(async (resolve) => {
    // VLINDER
    if (location.datasets.VLINDER) {
      return fetchVLINDER(location, resolve, times)
    }
    // Rijkswaterstaat
    if (location.datasets.Rijkswaterstaat) {
      return fetchRWS(location, resolve, times, DSTDates)
    }
    //KNMI
    if (location.datasets.KNMI) {
      return fetchKNMI(location, resolve, times)
    }
    //Meetnet Vlaamse Banken
    if (location.datasets.MVB) {
      return fetchMVB(location, resolve, times, DSTDates)
    }
  })

  if (dataFetched.data.error) {
    logFetchErrors(dataFetched, response)
    for (let i = 0; i < 3; i++) values.push([])
  } else
    for (let i = 0; i < 3; i++) values.push(dataFetched.data[dataset][i])

  //Forecast
  if (forecastData[location.id]) {
    const startForecastTimeIndex = forecastData[location.id].findIndex(location => location.date == dateToday)
    const startForecastTime = forecastData[location.id][startForecastTimeIndex].time
    const startForecastTimeIndexInTimeSeries = times.indexOf(startForecastTime)

    let wind_forecast = new Array(times.length),
      wind_forecastGust = new Array(times.length),
      wind_forecastDirection = new Array(times.length)

    const indexFirstForecastTimeToday = forecastData[location.id].findIndex(location => location.date == dateToday)
    const amountHourValues = forecastData[location.id].length - indexFirstForecastTimeToday

    for (let i = 0; i < amountHourValues; i++) {
      wind_forecast[startForecastTimeIndexInTimeSeries + i * NoMeasurementsXHour] = forecastData[location.id][i + startForecastTimeIndex].s
      wind_forecastDirection[startForecastTimeIndexInTimeSeries + i * NoMeasurementsXHour] = forecastData[location.id][i + startForecastTimeIndex].d
      wind_forecastGust[startForecastTimeIndexInTimeSeries + i * NoMeasurementsXHour] = forecastData[location.id][i + startForecastTimeIndex].g
    }
    values.push(calcInterpolation(wind_forecast, times, startForecastTimeIndexInTimeSeries))
    values.push(calcInterpolation(wind_forecastDirection, times, startForecastTimeIndexInTimeSeries))
    values.push(calcInterpolation(wind_forecastGust, times, startForecastTimeIndexInTimeSeries))
  }

  let timeStampRun,
    timeRun = "N.A.",
    timeNextRun
  if (forecastData.timeRun && forecastData[location.id]) {
    timeStampRun = utcToZonedTime(parseISO(`${forecastData.timeRun}Z`), timeZone)
    timeRun = format(timeStampRun, "HH:mm")
    timeNextRun = format(add(timeStampRun, { hours: (2 + 6), minutes: 58 }), "HH:mm")
  }

  if (values[2].length == 0 && values[3].length == 0 && values[4].length == 0 && values[5]) {
    log(`Location "${location.name}" doesn't have any measurements!`, "fetchError", true)
  }
  if (values[2].length == 0 && values[3].length == 0 && values[4].length == 0 && !values[5]) {
    log(`Location "${location.name}" doesn't have any data (neither measurements nor forecast)!`, "fetchError", true)
    response.json({ errorCode: 204 })
    return
  }

  //Simulate a timeout
  const sleep = ms => new Promise(r => setTimeout(r, ms))
  await sleep(30000)

  clearTimeout(timeOutTimer)

  if (!response.headersSent)
    // AKA if a timeout hasn't occured
    response.json({
      values: values,
      spotName: location.name,
      dataset: dataset,
      forecastRun: timeRun,
      nextForecastRun: timeNextRun
    })
}