import { format, addDays, subDays, isSameDay, add, addHours, subHours } from "date-fns"
import module from "date-fns-tz"
const { utcToZonedTime } = module

const timeZone = "Europe/Amsterdam"

export function logFetchErrors(dataFetched, response) {
  if (!dataFetched) return

  const errorCode = dataFetched.data.error.code

  if (errorCode == "ENOTFOUND")
    log(`API endpoint ${dataFetched.data.dataset} doesn't exist, or there's a network error! (${errorCode})`, "fetchError", true)
  else if (errorCode == "ECONNRESET" || errorCode == "EPROTO")
    log(`Network problem reaching API! (${errorCode})`, "fetchError", true)
  else if (errorCode == "EHOSTUNREACH")
    log(`Network problem reaching API! (${errorCode})`, "fetchError", true)
  else if (errorCode == "ETIMEDOUT")
    log(`Request timed out of API ${dataFetched.data.dataset}! (${errorCode})`, "fetchError", true)
  else if (errorCode == "ERR_INVALID_URL")
    log(`Invalid URL! (${errorCode})`, "fetchError", true)
  else {
    log(JSON.stringify(dataFetched), "fetchError", true)
    response.redirect('/error')
  }
}

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
  if (dateParsed > DSTDates.toDST && dateParsed < DSTDates.fromDST) {
    // Summertime
    startTime = endTime = "22:00:00"

    dateStartFetch = subDays(dateParsed, 1)
    if (isSameDay(dateStartFetch, DSTDates.toDST) && dateStartFetch.getHours() === 22) dateStartFetch = addHours(dateStartFetch, 1)
    dateStartFetch = format(utcToZonedTime(dateStartFetch, timeZone), "yyyy-MM-dd")
    //Explaination for above: if the system is using UTC timezone, subDays will subtract 24 hours instead of 23. This is because UTC doesn't use DST.
    //Because of this, the format function doesn't pick the right day

    dateEndFetch = format(utcToZonedTime(dateParsed, timeZone), "yyyy-MM-dd")
  } else if (isSameDay(dateParsed, DSTDates.toDST)) {
    //Day of going to summertime
    startTime = "00:00:00"
    endTime = "22:00:00"
    dateStartFetch = dateEndFetch = format(utcToZonedTime(dateParsed, timeZone), "yyyy-MM-dd")
  } else if (isSameDay(dateParsed, DSTDates.fromDST)) {
    //Day of going to wintertime
    startTime = "22:00:00"
    endTime = "00:00:00"
    dateStartFetch = format(utcToZonedTime(sub(dateParsed, { days: 1 }), timeZone), "yyyy-MM-dd")
    dateEndFetch = format(utcToZonedTime(add(dateParsed, { days: 1, hours: 2 }), timeZone), "yyyy-MM-dd")
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
  //All fetcherrors are handled in logFetchErrors in serverFunctions.js

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
export function giveMVBFetchOptions(dateParsed, DSTDates, databaseData, newToken) {

  const keyFetch = newToken || MVBAPIKey.APIKey
  const locationID = JSON.stringify(databaseData.datasets.MVB.location_id)
  const dateStartFetch = dateParsed.toISOString()
  let dateEndFetch = addDays(dateParsed, 1)

  if (isSameDay(dateParsed, DSTDates.fromDST) && global.serverTimeZone === "UTC") dateEndFetch = addHours(dateEndFetch, 1).toISOString()
  // Check if the date requested is the day of switching from summertime to wintertime. This day contains 25 hours, and since UTC doesn't include DST, it just 
  // adds 24 hours in the addDays function above. The requested data will therefore miss 1 hour of data for the requested day.
  if (isSameDay(dateParsed, DSTDates.toDST) && global.serverTimeZone === "UTC") dateEndFetch = subHours(dateEndFetch, 1).toISOString()
  // Check if the date requested is the day of switching from wintertime to summertime. This day contains 23 hours, and since UTC doesn't include DST, it just 
  // adds 24 hours in the addDays function above. The requested data will therefore contain 1 extra hour (of the day after) which will confuse the rest of the script and cause a bug.

  else dateEndFetch = dateEndFetch.toISOString()

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

export function MessageError(rawData, resolve) {
  //All fetcherrors are handled in logFetchErrors in serverFunctions.js

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

export function JSONErrorVLINDER(rawData) {
  if (!rawData || !rawData.length) return true

  //All other errors (exept for when there's no data at all) are handled in logFetchErrors in serverFunctions.js
  if (rawData.error) {
    if (rawData.error == "not found") return false //This error is not handled here
  }
  return false
}

//KNMI specific

export function KNMIerror(rawData, resolve) {
  if (rawData.error) {
    log(`KNMI API error: \"${rawData.error}\"`, "error", true)

    resolve({
      data: {
        "KNMI": [
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