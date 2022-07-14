import { format, addDays, sub, isSameDay } from "date-fns"
import module from "date-fns-tz"
const { utcToZonedTime } = module

const timeZone = "Europe/Amsterdam"

export function catchError(resolve, data, error, dataset) {
  data = { error: error, dataset: dataset }
  resolve({ data })
}

export function processAllNegativeArrays(wind_speed, wind_gusts, wind_direction) {
  if (!wind_speed.some(value => value > 0)) wind_speed = []
  if (!wind_gusts.some(value => value > 0)) wind_gusts = []
  if (!wind_direction.some(value => value > 0)) wind_direction = []

  //This error is not handled here, just return empty array(s)

  return [wind_speed, wind_gusts, wind_direction]
}

//Rijkswaterstaat specific
export function giveRWSFetchOptions(dateParsed, databaseData, DSTDates) {

  let startTime, endTime, dateStartFetch, dateEndFetch
  if (dateParsed > DSTDates[0] && dateParsed < DSTDates[1]) {
    // Summertime
    startTime = endTime = "22:00:00"
    dateStartFetch = format(utcToZonedTime(sub(dateParsed, { days: 1 }), timeZone), "yyyy-MM-dd")
    dateEndFetch = format(utcToZonedTime(dateParsed, timeZone), "yyyy-MM-dd")
  } else if (isSameDay(dateParsed, DSTDates[0])) {
    //Day of going to summertime
    startTime = "00:00:00"
    endTime = "22:00:00"
    dateStartFetch = dateEndFetch = format(utcToZonedTime(dateParsed, timeZone), "yyyy-MM-dd")
  } else if (isSameDay(dateParsed, DSTDates[1])) {
    //Day of going to wintertime
    startTime = "22:00:00"
    endTime = "00:00:00"
    dateStartFetch = format(utcToZonedTime(sub(dateParsed, { days: 1 }), timeZone), "yyyy-MM-dd")
    dateEndFetch = format(dateParsed, "yyyy-MM-dd")
  } else {
    //Wintertime
    startTime = endTime = "00:00:00"
    dateStartFetch = format(utcToZonedTime(dateParsed, timeZone), "yyyy-MM-dd")
    dateEndFetch = format(utcToZonedTime(addDays(dateParsed, 1), timeZone), "yyyy-MM-dd")
  }
  //All above is needed due to *** RWS API

  const locationID = databaseData.datasets.Rijkswaterstaat.location_id
  const locationX = databaseData.x
  const locationY = databaseData.y

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
        "Begindatumtijd": `${dateStartFetch}T${startTime}.000+01:00`,
        "Einddatumtijd": `${dateEndFetch}T${endTime}.000+01:00`
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
          "Code": "WINDSTOOT"
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

export function SuccesvolFalseError(rawData, resolve) {
  //All fetcherrors are handled in logFetchErrors.js

  if (rawData.Foutmelding) log(`Rijkswaterstaat API "Succesvol"-error: ${rawData.Foutmelding}`, "error", true)

  if (!rawData.Succesvol) {
    resolve({
      data: {
        "Rijkswaterstaat": [
          [],
          [],
          []
        ]
      }
    })

    return true
  }

  return false

}

//MVB specific
export function giveMVBFetchOptions(dateParsed, databaseData, newToken) {

  const keyFetch = newToken || MVBAPIKey.APIKey
  const locationID = JSON.stringify(databaseData.datasets.MVB.location_id)
  const dateStartFetch = dateParsed.toISOString()
  const dateEndFetch = addDays(dateParsed, 1).toISOString()

  return {
    "headers": {
      "authorization": `Bearer ${keyFetch}`,
      "content-type": "application/json; charset=UTF-8"
    },
    "body": `{\"StartTime\":\"${dateStartFetch}\",\"EndTime\":\"${dateEndFetch}\",\"IDs\":${locationID}}`,
    "method": "POST"
  }
}

export function giveMVBOverviewFetchOptions(locationsArray, newToken) {

  const keyFetch = newToken || MVBAPIKey.APIKey
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

export function MessageError(rawData, resolve) {
  //All fetcherrors are handled in logFetchErrors.js

  if (rawData.Message) {
    log(`Meetnet Vlaamse Banken API "Message"-error: ${rawData.Message}`, "error", true)

    resolve({
      data: {
        "MVB": [
          [],
          [],
          []
        ]
      }
    })

    return true
  }

  return false
}

export function theoreticalMeasurements(measurementTimes, times) {
  if (measurementTimes.length == 0) return

  const lastMeasurementTime = measurementTimes[measurementTimes.length - 1]
  const theoreticalMeasurementCount = times.indexOf(lastMeasurementTime)

  return theoreticalMeasurementCount + 1
}

//VLINDER specific

export function VLINDERerror(rawData, resolve) {
  if (rawData.error) {
    log(`VLINDER API error: \"${rawData.error}\"`, "error", true)

    resolve({
      data: {
        "VLINDER": [
          [],
          [],
          []
        ]
      }
    })

    return true
  }

  return false
}