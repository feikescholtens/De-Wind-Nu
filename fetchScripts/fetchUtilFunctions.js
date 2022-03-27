import { getUnixTime, parse, format, add, sub, parseISO } from "date-fns"
import { readFileSync, writeFile } from 'fs';

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
export function giveRWSFetchOptions(databaseData, dateZoned) {

  const locationID = databaseData.datasets.Rijkswaterstaat.location_id
  const locationX = databaseData.x
  const locationY = databaseData.y

  const dateTodayFetch = format(dateZoned, "yyyy-MM-dd")
  const dateTomorrowFetch = format(add(dateZoned, { days: 1 }), "yyyy-MM-dd")
  const time = "00:00:00"

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
        "Begindatumtijd": `${dateTodayFetch}T${time}.000+01:00`,
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
export function giveMVBFetchOptions(databaseData, dateZoned, newToken) {

  const keyFetch = newToken || JSON.parse(readFileSync("Meetnet Vlaamse Banken API key.json")).APIKey
  const locationID = JSON.stringify(databaseData.datasets.MVB.location_id)
  const dateYesterdayFetch = format(sub(dateZoned, {
    days: 1
  }), "yyyy-MM-dd")
  const dateTodayFetch = format(dateZoned, "yyyy-MM-dd")

  return {
    "headers": {
      "authorization": `Bearer ${keyFetch}`,
      "content-type": "application/json; charset=UTF-8"
    },
    "body": `{\"StartTime\":\"${dateYesterdayFetch}T23:00:00.000Z\",\"EndTime\":\"${dateTodayFetch}T23:00:00.000Z\",\"IDs\":${locationID}}`,
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

export function saveNewApiKey(rawData) {
  const expiresString = add(parse(rawData[".expires"], "EEE, dd MMM yyyy HH:mm:ss 'GMT'", new Date()), { hours: 1 })
  const issuedString = add(parse(rawData[".issued"], "EEE, dd MMM yyyy HH:mm:ss 'GMT'", new Date()), { hours: 1 })
  writeFile("Meetnet Vlaamse Banken API key.json", JSON.stringify({
    "expirationDate": getUnixTime(expiresString),
    "issuedDate": getUnixTime(issuedString),
    "APIKey": rawData["access_token"]
  }, null, 2), error => {
    if (error) {
      log(error, "error")
      resolve({ data })
    }
  })
}

export function theoreticalMeasurements(measurementTimes, times) {
  if (measurementTimes.length == 0) return

  const lastMeasurementHH = measurementTimes[measurementTimes.length - 1].substring(0, 2)
  const lastMeasurementmm = measurementTimes[measurementTimes.length - 1].substring(3, 5)

  const theoreticalMeasurementCount = times.indexOf(`${lastMeasurementHH}:${lastMeasurementmm}`)

  return theoreticalMeasurementCount + 1
}