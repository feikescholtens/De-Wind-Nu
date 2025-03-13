import fetch from "node-fetch"
import { catchError, getMatchedIDs } from "../fetchUtilFunctions.js"
import { giveRWSOverviewFetchOptions } from "./helperFunctionsForOverview.js"
import { SuccesvolFalseError } from "./helperFunctions.js"
import { parseISO } from "date-fns"

export async function fetchDataForOverview_RWS(locations, resolve) {

  let data = {}, // data is the object that will be returned
    rawData // rawData is the raw data fetched from the API

  const rawDataString = await fetch("https://waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGENSERVICES_DBO/OphalenLaatsteWaarnemingen", giveRWSOverviewFetchOptions(locations))
    .then(response => response.text()).catch((error) => catchError(resolve, {}, error, "RWS")) // This handles all errors that can occur during the fetch, like timeouts or no internet connection

  try { rawData = JSON.parse(rawDataString) } catch { return } // If the data can't be parsed to JSON, return
  if (SuccesvolFalseError(rawData, resolve)) return // RWS API returns false for "Succesvol" when there is no data, which is convenient

  const IDMatches = getMatchedIDs(locations, "RWS") // Array with objects that contain the application ID and the RWS ID

  rawData.WaarnemingenLijst.forEach(locationData => { // For each location with latest measurements

    const applicationID = IDMatches[locationData.Locatie.Code] // Get application ID for the RWS location
    if (data[applicationID] == undefined) data[applicationID] = {} // Create object for the application ID if it doesn't exist

    const parameterName = locationData.AquoMetadata.Grootheid.Code // Like "WINDSHD" or "WINDSTOOT"
    const measurementValue = locationData.MetingenLijst[0].Meetwaarde.Waarde_Numeriek // Numeric value of the measurement

    if (parameterName == "WINDSHD") data[applicationID].windSpeed = measurementValue * 1.94384449 // Convert m/s to knots
    if (parameterName == "WINDSTOOT") data[applicationID].windGusts = measurementValue * 1.94384449 // Convert m/s to knots
    if (parameterName == "WINDRTG") data[applicationID].windDirection = measurementValue

    if (parameterName == "WINDSHD") data[applicationID].timeStamp = parseISO(locationData.MetingenLijst[0].Tijdstip).toISOString() // Convert timestamp of windspeed measurement to ISO string

  })

  resolve(data)
}