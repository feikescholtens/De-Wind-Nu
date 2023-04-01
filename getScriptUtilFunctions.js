import { startOfDay, sub, subHours } from "date-fns"
import module from "date-fns-tz"
const { getTimezoneOffset } = module
import { Firestore } from "@google-cloud/firestore"
import { firestoreAuth } from "./forecastFunctions.js"

export function getTimeChangeDates(date) {

  const year = date.getFullYear()

  let DSTStart = new Date(year, 3 - 1, 31)
  for (let i = 0; i <= 7; i++) {
    if (DSTStart.getDay() == 0) break
    DSTStart = sub(DSTStart, { days: 1 })
  }
  if (DSTStart.getUTCHours() !== 23) DSTStart = sub(DSTStart, { hours: 1 })

  let DSTEnd = new Date(year, 10 - 1, 31)
  for (let i = 0; i <= 7; i++) {
    if (DSTEnd.getDay() == 0) break
    DSTEnd = sub(DSTEnd, { days: 1 })
  }
  if (DSTEnd.getUTCHours() !== 22) DSTEnd = sub(DSTEnd, { hours: 2 })

  return { toDST: DSTStart, fromDST: DSTEnd }

}

export function generateTimes(measurementEveryXMinutes, timeZoneChange) {
  let times = []
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60 / measurementEveryXMinutes; j++) {
      let hour = i
      let minute = measurementEveryXMinutes * j

      if (hour < 10 && minute < 10) times.push(`0${hour}:0${minute}`)
      if (hour < 10 && minute >= 10) times.push(`0${hour}:${minute}`)
      if (hour >= 10 && minute < 10) times.push(`${hour}:0${minute}`)
      if (hour >= 10 && minute >= 10) times.push(`${hour}:${minute}`)
    }
  }

  if (timeZoneChange) {
    if (timeZoneChange == "toDST") {
      const begin = times.slice(0, 2 * (60 / measurementEveryXMinutes))
      const end = times.slice(3 * (60 / measurementEveryXMinutes))

      times = begin.concat(end)
    }
    if (timeZoneChange == "fromDST") {
      const begin = times.slice(0, 3 * (60 / measurementEveryXMinutes))
      const middle = times.slice(2 * (60 / measurementEveryXMinutes), 3 * (60 / measurementEveryXMinutes))
      const end = times.slice(3 * (60 / measurementEveryXMinutes))

      times = begin.concat(middle).concat(end)
    }
  }

  times.push("00:00")
  return times
}

export function calcInterpolation(array, times, startTimeIndexInTimes, stopTimeIndexInTimes) {

  let interpolatedData = []

  for (let i = startTimeIndexInTimes; i < array.length; i++) {
    let j

    if (array[i] == undefined) {
      for (j = i + 1; j < array.length; j++) {
        if (array[j] != undefined) break
      }

      const startIndex = i - 1,
        stopIndex = j
      const startValue = parseFloat(array[startIndex]),
        stopValue = parseFloat(array[stopIndex])

      for (let k = startIndex; k < stopIndex - 1; k++) {
        const value = startValue + ((stopValue - startValue) / (stopIndex - startIndex)) * (k + 1 - startIndex)
        if (value) interpolatedData.push({ time: times[k + 1], index: k + 1, value: value })
      }
      i = j
    }
  }

  for (let k = startTimeIndexInTimes; k < stopTimeIndexInTimes; k++) {
    if (array[k] == undefined) {
      const interpolatedValue = interpolatedData.filter(element => element.index == k)[0].value
      array[k] = interpolatedValue
    }
  }

  return array
}

export async function getArchivedForecast(date, locationID) {
  const firestore = new Firestore(firestoreAuth())

  const document = await firestore.doc(`Harmonie forecast archive/${date}`).get()

  if (!document.exists) return null
  return document.get(locationID)
}

export function startOfDayTimeZone(date, timeZone) {

  date = startOfDay(date)

  if (date.getUTCHours() == 0) {
    date = subHours(date, getTimezoneOffset(timeZone, date) / 1000 / 3600)
  }

  return date
}