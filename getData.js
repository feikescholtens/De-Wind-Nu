import { logFetchErrors } from "./logFetchErrors.js"
import { validID } from "./serverFunctions.js"
import { fetchVLINDER } from "./fetchScripts/getData/VLINDER.js"
import { fetchRWS } from "./fetchScripts/getData/Rijkswaterstaat.js"
import { fetchKNMI } from "./fetchScripts/getData/KNMI.js"
import { fetchMVB } from "./fetchScripts/getData/MVB.js"
import { getTimeChangeDates, generateTimes, calcInterpolation, restartHerokuDynos, getArchivedForecast } from "./getScriptUtilFunctions.js"
import { format, add, parseISO, parse, startOfDay, isBefore, isValid } from "date-fns"
import module from "date-fns-tz"
const { utcToZonedTime, toDate } = module

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

  let dateParsed = parse(date, "dd-MM-yyyy", new Date())
  console.log("dermate", toDate(dateParsed, { timeZone: timeZone }))
  if (!isValid(dateParsed)) dateParsed = new Date()
  const locationID = request.params.id
  const location = locations[locationID]
  const dataset = Object.keys(location.datasets)[0]
  let values = {}

  //Times 
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
  values["times"] = times.copy()
  times[times.length - 1] = "00:00_nextDay"

  //Measurements
  const dataFetched = await new Promise(async (resolve) => {
    // VLINDER
    if (location.datasets.VLINDER) {
      return fetchVLINDER(dateParsed, location, resolve, times)
    }
    // Rijkswaterstaat
    if (location.datasets.Rijkswaterstaat) {
      return fetchRWS(dateParsed, location, resolve, times, DSTDates)
    }
    //KNMI
    if (location.datasets.KNMI) {
      return fetchKNMI(dateParsed, location, resolve, times)
    }
    //Meetnet Vlaamse Banken
    if (location.datasets.MVB) {
      return fetchMVB(dateParsed, location, resolve, times, DSTDates)
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
  let forecastObj, forecastInfoString = "niet beschikbaar"

  //Check if requested forecast is in the past or not, set the forecast for that location for that day to forecastObj and set the forecast information string accordingly 
  if (!isBefore(dateParsed, startOfDay(new Date()))) {
    if (forecastData[locationID]) {
      forecastObj = forecastData[locationID]

      const forecastRun = parseISO(forecastData.timeRun + "Z")
      const forecastRunLocal = utcToZonedTime(forecastRun, "Europe/Amsterdam")
      const forecastRunString = format(forecastRunLocal, "HH:mm")

      const timeNextRun = add(forecastRunLocal, { hours: (2 + 6), minutes: 58 })
      const timeNextRunString = format(timeNextRun, "HH:mm")
      forecastInfoString = `HARMONIE model van het KNMI, run van ${forecastRunString}, volgende update ± ${timeNextRunString}`
    }
  } else {
    const archivedForecast = await getArchivedForecast(date, locationID)
    if (archivedForecast) {
      forecastObj = archivedForecast
      forecastInfoString = "HARMONIE model van het KNMI, uit archief"
    }
  }

  //This object might become undefined when there is no forecast available, so only proceed when not so
  if (forecastObj) {

    //Where in the forecastObj (the index) the forecast for the requested date starts
    const startIndex = forecastObj.findIndex(location => location.date == date)

    //Where in the forecastObj (the index) the forecast for the requested date stops
    let stopIndex
    const tempIndex = forecastObj.slice(startIndex).findIndex(location => location.date !== date)
    if (tempIndex !== -1) stopIndex = startIndex + tempIndex
    else stopIndex = forecastObj.length - 1

    //Only proceed if forecast for that day exists AND that not only the forecast for 0:00 is available
    if (startIndex !== -1 && startIndex !== forecastObj.length - 1) {

      //Time of first forecast value (for requested day) and the index of that time in the times array
      const startTime = forecastObj[startIndex].time
      const startTimeIndexInTimes = times.indexOf(startTime)

      //Time of last forecast value (for requested day) and the index of that time in the times array
      const stopTime = forecastObj[stopIndex].time
      let stopTimeIndexInTimes = times.indexOf(stopTime)
      //If there is a full day of forecast available (so stopTime is at midnight of next day), set the index in the times array to it's last value.
      //This prevents the indexOf function from the codeline above to take the first 0:00 in the series 
      if (stopTime == "00:00") stopTimeIndexInTimes = times.length - 1

      let windSpeedForecast = new Array(times.length),
        windGustsForecast = new Array(times.length),
        windDirectionForecast = new Array(times.length)

      const amountHourValues = stopIndex - startIndex + 1

      for (let i = 0; i < amountHourValues; i++) {
        windSpeedForecast[startTimeIndexInTimes + i * NoMeasurementsXHour] = forecastObj[i + startIndex].s
        windGustsForecast[startTimeIndexInTimes + i * NoMeasurementsXHour] = forecastObj[i + startIndex].g
        windDirectionForecast[startTimeIndexInTimes + i * NoMeasurementsXHour] = forecastObj[i + startIndex].d
      }

      //Here the 3 arrays above have the forecasted values in the right places. The gaps inbeween are filled in with the interpolation function below
      values["windSpeedForecast"] = calcInterpolation(windSpeedForecast, times, startTimeIndexInTimes, stopTimeIndexInTimes)
      values["windGustsForecast"] = calcInterpolation(windGustsForecast, times, startTimeIndexInTimes, stopTimeIndexInTimes)
      values["windDirectionForecast"] = calcInterpolation(windDirectionForecast, times, startTimeIndexInTimes, stopTimeIndexInTimes)

    }
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
      forecastInfoString: forecastInfoString
    })
}