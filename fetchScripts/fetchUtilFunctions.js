export function catchError(resolve, data, error, dataset) {
  data = { error: error, dataset: dataset }
  resolve({ data })
}

//Rijkswaterstaat specific
export function loopArrayRelativeIndex(i, metingenCategoriesLength, rawData) {
  let loopArray, relativeIndex

  if (i < metingenCategoriesLength) {
    loopArray = rawData.meting.values
    relativeIndex = i
  } else {
    loopArray = rawData.verwachting.values
    relativeIndex = i - metingenCategoriesLength
  }

  return { loopArray, relativeIndex }
}

export function lastMeasurementIndex(dataCategorized, i) {
  const reverseArray = JSON.parse(JSON.stringify(dataCategorized[i])).reverse()
  const lastMeasurementIndex = reverseArray.length - reverseArray.findIndex(measurement => measurement !== null)

  return lastMeasurementIndex
}

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