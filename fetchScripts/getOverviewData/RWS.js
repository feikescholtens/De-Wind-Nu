import fetch from "node-fetch"
import { catchError, giveRWSOverviewFetchOptions, SuccesvolFalseError } from "../fetchUtilFunctions.js"
import { parseISO } from "date-fns"

export async function overviewFetchRWS(locations, resolve) {

  let locationsArray = [],
    IDMatches = []

  for (const id in locations) {
    if (locations[id].RWS_ID) {
      locationsArray.push({
        X: locations[id].RWS_COORDS[0],
        Y: locations[id].RWS_COORDS[1],
        Code: locations[id].RWS_ID
      })

      IDMatches.push({
        applicationID: id,
        RWS: locations[id].RWS_ID,
      })
    }
  }

  const rawDataString = await fetch("https://waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGENSERVICES_DBO/OphalenLaatsteWaarnemingen", giveRWSOverviewFetchOptions(locationsArray))
    .then(response => response.text()).catch((error) => catchError(resolve, {}, error, "RWS"))

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }

  let data = {}

  if (SuccesvolFalseError(rawData, resolve)) return

  rawData.WaarnemingenLijst.forEach(locationData => {

    //Match reveived location with one from own list to get application ID for each location
    for (let i = 0; i < IDMatches.length; i++) {
      if (IDMatches[i].RWS == locationData.Locatie.Code) {

        locationData.MetingenLijst.forEach(() => {

          //This is needed b.c. messy RWS API
          locationData.MetingenLijst.sort((a, b) => {
            return new Date(b.Tijdstip) - new Date(a.Tijdstip)
          })

          let correctIndex
          if (locationData.MetingenLijst[0].Meetwaarde.Waarde_Numeriek !== 9.99999999E8) correctIndex = 0
          else correctIndex = 1
          //

          if (locationData.AquoMetadata.Grootheid.Code == "WINDSHD") {
            const windSpeed = locationData.MetingenLijst[correctIndex].Meetwaarde.Waarde_Numeriek * 1.94384449

            if (!data[IDMatches[i].applicationID]) data[IDMatches[i].applicationID] = { windSpeed: windSpeed }
            else data[IDMatches[i].applicationID].windSpeed = windSpeed

            data[IDMatches[i].applicationID].timeStamp = parseISO(locationData.MetingenLijst[correctIndex].Tijdstip).toISOString()
          }
          if (locationData.AquoMetadata.Grootheid.Code == "WINDSTOOT") {
            const windGusts = locationData.MetingenLijst[correctIndex].Meetwaarde.Waarde_Numeriek * 1.94384449

            if (!data[IDMatches[i].applicationID]) data[IDMatches[i].applicationID] = { windGusts: windGusts }
            else data[IDMatches[i].applicationID].windGusts = windGusts
          }
          if (locationData.AquoMetadata.Grootheid.Code == "WINDRTG") {
            const windDirection = locationData.MetingenLijst[correctIndex].Meetwaarde.Waarde_Numeriek

            if (!data[IDMatches[i].applicationID]) data[IDMatches[i].applicationID] = { windDirection: windDirection }
            else data[IDMatches[i].applicationID].windDirection = windDirection
          }

        })

        break
      }
    }

  })

  resolve(data)
}