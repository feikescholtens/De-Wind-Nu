import fetch from "node-fetch"
import { VLINDERerror } from "./helperFunctions.js"
import { parse } from "date-fns"
import { catchError, getMatchedIDs } from "../fetchUtilFunctions.js"

export async function fetchDataForOverview_VLINDER(locations, resolve) {

  let data = {}, // data is the object that will be returned
    rawData // rawData is the raw data fetched from the API

  const rawDataString = await fetch("https://mooncake.ugent.be/api/measurements")
    .then(response => response.text()).catch((error) => catchError(resolve, {}, error, "VLINDER")) // This handles all errors that can occur during the fetch, like timeouts or no internet connection

  try { rawData = JSON.parse(rawDataString) } catch { return } // If the data can't be parsed to JSON, return
  if (VLINDERerror(rawData, resolve)) return // Check if the data returned contains an error

  const IDMatches = getMatchedIDs(locations, "VLINDER") // Array with objects that contain the application ID and the RWS ID

  rawData.forEach(locationData => {
    const applicationID = IDMatches[locationData.id] // Get application ID for the VLINDER location

    const windSpeed = locationData.windSpeed * 0.539956803, // Convert km/h to knots
      windGusts = locationData.windGust * 0.539956803, // Convert km/h to knots
      windDirection = locationData.windDirection,
      timeStamp = parse(locationData.time.substring(5, locationData.time.length - 4) + " Z", "dd MMM yyyy HH:mm:ss X", new Date()).toISOString()

    data[applicationID] = {
      windSpeed: windSpeed,
      windGusts: windGusts,
      windDirection: windDirection,
      timeStamp: timeStamp
    }
  })

  resolve(data)
}