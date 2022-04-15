import { sub } from "date-fns"

export function getTimeChangeDates() {

  const currentYear = new Date().getFullYear()

  let DSTStart = new Date(currentYear, 3 - 1, 31)
  for (let i = 0; i <= 7; i++) {
    if (DSTStart.getDay() == 0) break
    DSTStart = sub(DSTStart, { days: 1 })
  }

  let DSTEnd = new Date(currentYear, 10 - 1, 31)

  for (let i = 0; i <= 7; i++) {
    if (DSTEnd.getDay() == 0) break
    DSTEnd = sub(DSTEnd, { days: 1 })
  }

  return [DSTStart, DSTEnd]

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

export function calcInterpolation(array, times, startInterpolationIndex) {

  let interpolatedData = []

  for (let i = startInterpolationIndex; i < array.length; i++) {
    let j

    if (!array[i] && array[i] !== 0) {
      for (j = i + 1; j < array.length; j++) {
        if (array[j]) break
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

  for (let k = startInterpolationIndex; k < times.length; k++) {
    if (!array[k] && array[k] !== 0) {
      const interpolatedValue = interpolatedData.filter(element => element.index == k)[0].value
      array[k] = interpolatedValue
    }
  }

  array = array.slice(0, times.length)

  return array
}