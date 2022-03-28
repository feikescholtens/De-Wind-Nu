import { format, add, sub } from "date-fns"
import { readFileSync } from 'fs'

export function catchError(resolve, data, error, dataset) {
  data = { error: error, dataset: dataset }
  resolve({ data })
}

export function processAllNegativeArrays(wind_speed, wind_gusts, wind_direction) {
  if (!wind_speed.some(value => value > 0) && !wind_gusts.some(value => value > 0) && !wind_direction.some(value => value > 0)) {
    return [
      [],
      [],
      []
    ] //This error is not handled here, just return empty arrays
  }

  return [wind_speed, wind_gusts, wind_direction]
}

//Rijkswaterstaat specific
export function giveRWSFetchOptions(databaseData, dateZoned, DSTDates) {

  let time, dateStartFetch
  if (new Date() >= add(DSTDates[0], { days: 1 }) && new Date() < add(DSTDates[1], { days: 1 })) {
    time = "22:00:00"
    dateStartFetch = format(sub(dateZoned, { days: 1 }), "yyyy-MM-dd")
  } else {
    time = "00:00:00"
    dateStartFetch = format(dateZoned, "yyyy-MM-dd")
  }

  const locationID = databaseData.datasets.Rijkswaterstaat.location_id
  const locationX = databaseData.x
  const locationY = databaseData.y

  const dateTomorrowFetch = format(add(dateZoned, { days: 1 }), "yyyy-MM-dd")

  return {
    "headers": {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    "body": JSON.stringify({
      "AquoPlusWaarnemingMetadata": {
        "AquoMetadata": {
          "Compartiment": { "Code": "LT" }
        }
      },
      "Locatie": { "X": locationX, "Y": locationY, "Code": `${locationID}` },
      "Periode": {
        "Begindatumtijd": `${dateStartFetch}T${time}.000+01:00`,
        "Einddatumtijd": `${dateTomorrowFetch}T${time}.000+01:00`
      }
    }),
    "method": "POST"
  }
}

export function giveRWSOverviewFetchOptions(locationsArray) {
  const fetchBody = {
    "AquoPlusWaarnemingMetadataLijst": [{
      "AquoMetadata": {
        "Grootheid": {
          "Code": "WINDSHD"
        }
      }
    }, {
      "AquoMetadata": {
        "Grootheid": {
          "Code": "WINDRTG"
        }
      }
    }],
    "LocatieLijst": locationsArray
  }

  return {
    "headers": {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    "body": JSON.stringify(fetchBody),
    "method": "POST"
  }
}

export function SuccesvolFalseError(rawData, locationName, data, resolve) {

  if (!rawData) return true

  //All other errors (exept for when there's no data at all) are handled in logFetchErrors.js
  if (rawData.Foutmelding) {
    if (rawData.Foutmelding == "Geen gegevens gevonden!") return false //This error is not handled here
  }
  return false
}

//MVB specific
export function giveMVBFetchOptions(databaseData, dateZoned, newToken, DSTDates) {

  const keyFetch = newToken || JSON.parse(readFileSync("Meetnet Vlaamse Banken API key.json")).APIKey
  const locationID = JSON.stringify(databaseData.datasets.MVB.location_id)
  const dateYesterdayFetch = format(sub(dateZoned, {
    days: 1
  }), "yyyy-MM-dd")
  const dateTodayFetch = format(dateZoned, "yyyy-MM-dd")

  let time
  if (new Date() >= add(DSTDates[0], { days: 1 }) && new Date() < add(DSTDates[1], { days: 1 })) {
    time = "22:00:00"
  } else {
    time = "23:00:00"
  }

  return {
    "headers": {
      "authorization": `Bearer ${keyFetch}`,
      "content-type": "application/json; charset=UTF-8"
    },
    "body": `{\"StartTime\":\"${dateYesterdayFetch}T${time}.000Z\",\"EndTime\":\"${dateTodayFetch}T${time}.000Z\",\"IDs\":${locationID}}`,
    "method": "POST"
  }
}

export function giveMVBOverviewFetchOptions(locationsArray, newToken) {

  const keyFetch = newToken || JSON.parse(readFileSync("Meetnet Vlaamse Banken API key.json")).APIKey
  return {
    "headers": {
      "authorization": `Bearer ${keyFetch}`,
      "content-type": "application/json; charset=UTF-8"
    },
    "body": `{
      "IDs": ${JSON.stringify(locationsArray)}
    }`,
    "method": "POST"
  }

}

export function JSONError(rawData) {
  if (!rawData || !rawData.length) return true

  //All other errors (exept for when there's no data at all) are handled in logFetchErrors.js
  if (rawData.error) {
    if (rawData.error == "not found") return false //This error is not handled here
  }
  return false
}

export function MessageError(rawData, data, resolve) {
  if (rawData.Message) {
    if (rawData.Message == "Login failed") {
      data = {
        error: {
          code: "LOGINFAILED"
        },
        dataset: "MVB"
      }
    }

    if (rawData.Message == "Authorization has been denied for this request.") {
      data = {
        error: { code: "AUTHDENIED" },
        dataset: "MVB"
      }
      resolve({ data })
    }

    resolve({ data })
    return true
  }
}

export function theoreticalMeasurements(measurementTimes, times) {
  if (measurementTimes.length == 0) return

  const lastMeasurementHH = measurementTimes[measurementTimes.length - 1].substring(0, 2)
  const lastMeasurementmm = measurementTimes[measurementTimes.length - 1].substring(3, 5)

  const theoreticalMeasurementCount = times.indexOf(`${lastMeasurementHH}:${lastMeasurementmm}`)

  return theoreticalMeasurementCount + 1
}