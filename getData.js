import { log } from "./serverFunctions.js"
import { isExistingLocation } from "./serverFunctions.js"
import { fetchDataForDay_VLINDER } from "./fetchScripts/VLINDER/fetchDataForDay.js"
import { fetchDataForDay_RWS } from "./fetchScripts/RWS/fetchDataForDay.js"
import { fetchDataForDay_KNMI } from "./fetchScripts/KNMI/fetchDataForDay.js"
import { fetchDataForDay_MVB } from "./fetchScripts/MVB/fetchDataForDay.js"
import { getTimeChangeDates, generateTimes, calcInterpolation, getArchivedForecast, startOfDayTimeZone } from "./getScriptUtilFunctions.js"
import { format, add, parseISO, isBefore, isValid, isToday, isFuture } from "date-fns"
import module from "date-fns-tz"
const { utcToZonedTime, formatInTimeZone } = module
import { Firestore } from "@google-cloud/firestore"
import { firestoreAuth } from "./getScriptUtilFunctions.js"

const timeZone = "Europe/Amsterdam"

export async function getData(request, response, date, locations) {

  if (!isExistingLocation(request.params.id, locations, response)) return

  const timeOutTimer = setTimeout(() => {
    response.json({ errorCode: 504 })
    //Basically 504 error but this prevents CloudFlare from showing it's message
    if (global.port == 3000) return

    log("Server should be restarted due to timed out!", "info", true)
  }, 29.5 * 1000)

  let dateParsed = parseISO(date),
    dateFormatted

  if (!isValid(dateParsed)) {
    dateParsed = startOfDayTimeZone(new Date(), timeZone)
    dateFormatted = format(utcToZonedTime(new Date(), timeZone), "dd-MM-yyyy")
  } else dateFormatted = format(utcToZonedTime(dateParsed, timeZone), "dd-MM-yyyy")

  const locationID = request.params.id
  const location = locations[locationID]
  const datasetMeasurements = location.measurements.source
  let values = {}

  //Times 
  let NoMeasurementsXHour = 6 // Default and also used for forecast only locations
  if (["RWS", "KNMI", "MVB"].includes(datasetMeasurements)) NoMeasurementsXHour = 6
  if (["VLINDER"].includes(datasetMeasurements)) NoMeasurementsXHour = 12
  let times
  const DSTDates = getTimeChangeDates(dateParsed)
  const dateToDST = format(utcToZonedTime(DSTDates.toDST, timeZone), "dd-MM")
  const dateFromDST = format(utcToZonedTime(DSTDates.fromDST, timeZone), "dd-MM")
  const dateRequest = format(utcToZonedTime(dateParsed, timeZone), "dd-MM")
  if (dateRequest == dateToDST) times = generateTimes(60 / NoMeasurementsXHour, "toDST")
  else if (dateRequest == dateFromDST) times = generateTimes(60 / NoMeasurementsXHour, "fromDST")
  else times = generateTimes(60 / NoMeasurementsXHour)
  values["times"] = times.customCopy()
  times[times.length - 1] = "00:00_nextDay"

  //Measurements
  const dataFetched = await new Promise(async (resolve) => {
    if (datasetMeasurements == null) { resolve(null); return } //This will run if the location is forecast only
    if (isFuture(dateParsed)) { resolve(null); return }

    if (datasetMeasurements == "VLINDER") return fetchDataForDay_VLINDER(dateParsed, location, resolve, times, DSTDates)
    if (datasetMeasurements == "RWS") return fetchDataForDay_RWS(dateParsed, location, resolve, times, DSTDates)
    if (datasetMeasurements == "KNMI") return fetchDataForDay_KNMI(dateParsed, location, resolve, times, DSTDates)
    if (datasetMeasurements == "MVB") return fetchDataForDay_MVB(dateParsed, location, resolve, times, DSTDates)
  })

  if (!dataFetched || dataFetched.data.error) {
    values["windSpeed"] = values["windGusts"] = values["windDirection"] = []
  } else {
    values["windSpeed"] = dataFetched.data[datasetMeasurements][0]
    values["windGusts"] = dataFetched.data[datasetMeasurements][1]
    values["windDirection"] = dataFetched.data[datasetMeasurements][2]
  }

  //Forecast
  let forecastObj, forecastInfoString = "niet beschikbaar"

  //Check if requested forecast is in the past or not, set the forecast for that location for that day to forecastObj and set the forecast information string accordingly 
  if (!isBefore(dateParsed, startOfDayTimeZone(new Date(), timeZone))) {
    //Fetch the forecast data from the firestore database
    const firestore = new Firestore(firestoreAuth())
    const forecastData = await (await firestore.doc("Harmonie forecast today & future v2/document").get()).data() || {}

    if (forecastData[locationID]) {
      forecastObj = forecastData[locationID]

      const forecastRun = parseISO(forecastData.timeRun + "Z") //The  + "Z" can be removed one parse-save-grib-harmonie-v2 is operational
      const forecastRunString = formatInTimeZone(forecastRun, "UTC", "HH:mm z")

      const timeNextRun = add(forecastRun, { hours: (1 + 2), minutes: 54 }) // Duration determined with script in googleCloudUtilities directory, based of ~864/19=45 publication times
      const timeNextRunString = formatInTimeZone(timeNextRun, "UTC", "HH:mm z")

      forecastInfoString = `HARMONIE model (versie Cy43) van het KNMI, run van ${forecastRunString}, volgende update ~${timeNextRunString} (± 8 minuten)`
    }
  } else {
    const archivedForecast = await getArchivedForecast(dateFormatted, locationID)
    if (archivedForecast) {
      forecastObj = archivedForecast
      forecastInfoString = "HARMONIE model van het KNMI, uit archief"
    }
  }

  //This object might become undefined when there is no forecast available, so only proceed when not so
  if (forecastObj) {

    //Where in the forecastObj (the index) the forecast for the requested date starts
    const startIndex = forecastObj.findIndex(location => location.date == dateFormatted)

    //Where in the forecastObj (the index) the forecast for the requested date stops
    let stopIndex
    const tempIndex = forecastObj.slice(startIndex).findIndex(location => location.date !== dateFormatted)
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

  if (values.windSpeed.length == 0 && values.windGusts.length == 0 && values.windDirection.length == 0 && values.windSpeedForecast && isToday(dateParsed)) {
    log(`Location "${location.name}" doesn't have any measurements for today!`, "fetchError", true)
  }
  if (values.windSpeed.length == 0 && values.windGusts.length == 0 && values.windDirection.length == 0 && !values.windSpeedForecast) {
    log(`Location "${location.name}" doesn't have any data (neither measurements nor forecast)!`, "fetchError", true)
    response.json({ errorCode: 204 })
  }

  clearTimeout(timeOutTimer)

  if (!response.headersSent)
    // AKA if a timeout hasn't occured
    response.json({
      date: dateParsed.toISOString(),
      values: values,
      datasetMeasurements: datasetMeasurements,
      forecastInfoString: forecastInfoString
    })
}