export function catchError(resolve, data, error, dataset) {
  data = { error: error, dataset: dataset }
  resolve({ data })
}

//Rijkswaterstaat specific
export function SuccesvolFalseError(rawData, data, resolve) {
  if (rawData.Foutmelding) {
    if (rawData.Foutmelding == "Geen gegevens gevonden!") {
      data = {
        error: {
          code: "14"
        },
        dataset: "RWS"
      }
    }

    resolve({ data })
    return true
  }
}
// export function loopArrayRelativeIndex(i, metingenCategoriesLength, rawData) {
//   let loopArray, relativeIndex

//   if (i < metingenCategoriesLength) {
//     loopArray = rawData.meting.values
//     relativeIndex = i
//   } else {
//     loopArray = rawData.verwachting.values
//     relativeIndex = i - metingenCategoriesLength
//   }

//   return { loopArray, relativeIndex }
// }

// export function lastMeasurementIndex(dataCategorized, i) {
//   const reverseArray = JSON.parse(JSON.stringify(dataCategorized[i])).reverse()
//   const lastMeasurementIndex = reverseArray.length - reverseArray.findIndex(measurement => measurement !== null)

//   return lastMeasurementIndex
// }

//MVB specific
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

import { writeFile } from 'fs';
import { getUnixTime, parse, add } from "date-fns"

export function saveNewApiKey(rawData) {
  const expiresString = add(parse(rawData[".expires"], "EEE, dd MMM yyyy HH:mm:ss 'GMT'", new Date()), { hours: 1 })
  const issuedString = add(parse(rawData[".issued"], "EEE, dd MMM yyyy HH:mm:ss 'GMT'", new Date()), { hours: 1 })
  writeFile("Meetnet Vlaamse Banken API key.json", JSON.stringify({
    "expirationDate": getUnixTime(expiresString),
    "issuedDate": getUnixTime(issuedString),
    "APIKey": rawData["access_token"]
  }, null, 2), (err) => {
    if (err) {
      console.log(err)
      resolve({ data })
    }
  })
}

export function theoreticalMeasurements(measurementTimes) {
  const lastMeasurementHH = measurementTimes[measurementTimes.length - 1].substring(0, 2)
  const lastMeasurementmm = measurementTimes[measurementTimes.length - 1].substring(3, 5)
  const theoreticalMeasurementCount = lastMeasurementHH * 6 + lastMeasurementmm / 10 + 1

  return theoreticalMeasurementCount
}