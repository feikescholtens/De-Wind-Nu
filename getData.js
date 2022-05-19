import { logFetchErrors } from "./logFetchErrors.js"
import { validID } from "./serverFunctions.js"
import { fetchVLINDER } from "./fetchScripts/getData/VLINDER.js"
import { fetchRWS } from "./fetchScripts/getData/Rijkswaterstaat.js"
import { fetchKNMI } from "./fetchScripts/getData/KNMI.js"
import { fetchMVB } from "./fetchScripts/getData/MVB.js"
import { getTimeChangeDates, generateTimes, calcInterpolation, restartHerokuDynos } from "./getScriptUtilFunctions.js"
import { format, add, parseISO, parse } from "date-fns"
import module from "date-fns-tz"
const { utcToZonedTime } = module

const timeZone = "Europe/Amsterdam"

export async function getData(request, response, date, locations, forecastData) {

  if (!validID(request.params.id, locations, response)) return

  const timeOutTimer = setTimeout(() => {
    response.json({ errorCode: 504 })
    //Basically 504 error but this prevents CloudFlare from showing it's message
    if (port == 3000) return

    log("Restarting server due to timed out request!", "info", true)
    restartHerokuDynos()
  }, 29.5 * 1000)
  //Triggering timeout 1/2 a second before Heroku does

  const dateParsed = parse(date, "dd-MM-yyyy", new Date())
  const locationID = request.params.id
  const location = locations[locationID]
  const dataset = Object.keys(location.datasets)[0]
  let values = {}

  //Date and times 
  let NoMeasurementsXHour
  if (["Rijkswaterstaat", "KNMI", "MVB"].includes(dataset)) NoMeasurementsXHour = 6
  if (["VLINDER"].includes(dataset)) NoMeasurementsXHour = 12
  let times
  const DSTDates = getTimeChangeDates(dateParsed)
  const dateToDST = format(utcToZonedTime(DSTDates[0], timeZone), "dd-MM")
  const dateFromDST = format(utcToZonedTime(DSTDates[1], timeZone), "dd-MM")
  const dateRequest = format(utcToZonedTime(dateParsed, timeZone), "dd-MM")
  if (dateRequest == dateToDST) times = generateTimes(60 / NoMeasurementsXHour, "toDST")
  else if (dateRequest == dateFromDST) times = generateTimes(60 / NoMeasurementsXHour, "fromDST")
  else times = generateTimes(60 / NoMeasurementsXHour)

  // times = generateTimes(60 / NoMeasurementsXHour)

  values["times"] = times
  console.log(times)

  //Measurements
  const dataFetched = await new Promise(async (resolve) => {
    // VLINDER
    if (location.datasets.VLINDER) {
      return fetchVLINDER(location, resolve, times)
    }
    // Rijkswaterstaat
    if (location.datasets.Rijkswaterstaat) {
      return fetchRWS(dateParsed, location, resolve, times, DSTDates)
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
    values["windSpeed"] = values["windGusts"] = values["windDirection"] = []
  } else {
    values["windSpeed"] = dataFetched.data[dataset][0]
    values["windGusts"] = dataFetched.data[dataset][1]
    values["windDirection"] = dataFetched.data[dataset][2]
  }

  //Forecast
  // if (forecastData[locationID]) {
  //   const startForecastTimeIndex = forecastData[locationID].findIndex(location => location.date == date)
  //   const startForecastTime = forecastData[locationID][startForecastTimeIndex].time
  //   const startForecastTimeIndexInTimeSeries = times.indexOf(startForecastTime)

  //   let wind_forecast = new Array(times.length),
  //     wind_forecastGust = new Array(times.length),
  //     wind_forecastDirection = new Array(times.length)

  //   const indexFirstForecastTimeToday = forecastData[locationID].findIndex(location => location.date == dateToday)
  //   const amountHourValues = forecastData[locationID].length - indexFirstForecastTimeToday

  //   for (let i = 0; i < amountHourValues; i++) {
  //     wind_forecast[startForecastTimeIndexInTimeSeries + i * NoMeasurementsXHour] = forecastData[locationID][i + startForecastTimeIndex].s
  //     wind_forecastDirection[startForecastTimeIndexInTimeSeries + i * NoMeasurementsXHour] = forecastData[locationID][i + startForecastTimeIndex].d
  //     wind_forecastGust[startForecastTimeIndexInTimeSeries + i * NoMeasurementsXHour] = forecastData[locationID][i + startForecastTimeIndex].g
  //   }
  //   values["windSpeedForecast"] = calcInterpolation(wind_forecast, times, startForecastTimeIndexInTimeSeries)
  //   values["windGustsForecast"] = calcInterpolation(wind_forecastGust, times, startForecastTimeIndexInTimeSeries)
  //   values["windDirectionForecast"] = calcInterpolation(wind_forecastDirection, times, startForecastTimeIndexInTimeSeries)
  // }

  let timeStampRun,
    timeRun = "N.A.",
    timeNextRun
  if (forecastData.timeRun && forecastData[locationID]) {
    timeStampRun = utcToZonedTime(parseISO(`${forecastData.timeRun}Z`), timeZone)
    timeRun = format(timeStampRun, "HH:mm")
    timeNextRun = format(add(timeStampRun, { hours: (2 + 6), minutes: 58 }), "HH:mm")
  }

  if (values.windSpeed.length == 0 && values.windGusts.length == 0 && values.windDirection.length == 0 && values.windSpeedForecast) {
    log(`Location "${location.name}" doesn't have any measurements!`, "fetchError", true)
  }
  if (values.windSpeed.length == 0 && values.windGusts.length == 0 && values.windDirection.length == 0 && !values.windSpeedForecast) {
    log(`Location "${location.name}" doesn't have any data (neither measurements nor forecast)!`, "fetchError", true)
    response.json({ errorCode: 204 })
  }

  //Simulate a timeout
  // const sleep = ms => new Promise(r => setTimeout(r, ms))
  // await sleep(30000)

  clearTimeout(timeOutTimer)

  if (!response.headersSent)
    // AKA if a timeout hasn't occured
    response.json({
      date: date,
      values: values,
      dataset: dataset,
      forecastRun: timeRun,
      nextForecastRun: timeNextRun
    })
}