import fetch from "node-fetch"
import { giveRWSOverviewFetchOptions, SuccesvolFalseError } from "../fetchUtilFunctions.js"

export async function overviewFetchRWS(locations, resolve) {

  let locationsArray = [],
    IDMatches = []
  locations.forEach(location => {
    if (Object.keys(location.datasets)[0] !== "Rijkswaterstaat") return

    locationsArray.push({
      X: location.x,
      Y: location.y,
      Code: location.datasets["Rijkswaterstaat"].location_id
    })

    IDMatches.push({
      applicationID: location.id,
      Rijkswaterstaat: location.datasets.Rijkswaterstaat.location_id,
    })
  })

  const rawDataString = await fetch("https://waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGENSERVICES_DBO/OphalenLaatsteWaarnemingen", giveRWSOverviewFetchOptions(locationsArray))
    .then(response => response.text())

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }

  let data = {}

  if (SuccesvolFalseError(rawData, data, resolve)) return

  rawData.WaarnemingenLijst.forEach(locationData => {

    //Match reveived location with one from own list to get application ID for each location
    for (let i = 0; i < IDMatches.length; i++) {
      if (IDMatches[i].Rijkswaterstaat == locationData.Locatie.Code) {

        locationData.MetingenLijst.forEach(() => {

          const wind_speed = locationData.MetingenLijst[0].Meetwaarde.Waarde_Numeriek * 1.94384449,
            wind_direction = locationData.MetingenLijst[0].Meetwaarde.Waarde_Numeriek

          if (locationData.AquoMetadata.Grootheid.Code == "WINDSHD") {
            if (!data[IDMatches[i].applicationID]) data[IDMatches[i].applicationID] = { wind_speed: wind_speed }
            else data[IDMatches[i].applicationID].wind_speed = wind_speed
          }
          if (locationData.AquoMetadata.Grootheid.Code == "WINDRTG") {
            if (!data[IDMatches[i].applicationID]) data[IDMatches[i].applicationID] = { wind_direction: wind_direction }
            else data[IDMatches[i].applicationID].wind_direction = wind_direction
          }

        })

        break
      }
    }

  })

  resolve(data)
}