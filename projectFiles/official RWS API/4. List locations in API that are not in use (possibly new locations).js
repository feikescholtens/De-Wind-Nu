import { readFileSync } from "fs"
import fetch from "node-fetch"
import { differenceInWeeks, parseISO } from "date-fns"
import transformation from "transform-coordinates"
const transform = transformation("EPSG:25831", "4326")

const locations = JSON.parse(readFileSync("Script outputs/1. Extract locations.json"))
const locationsInApp = parseLocationsInApp()
const locationsInKNMIAPI = ["WILH", "NIBE", "STVO", "MARK", "ROT1", "BERK", "HOTE", "VLIS", "DEKO"] //Locations that are in use in the app but use the KNMI API
const locationsDouble = ["HUB1", "SCHA"] //Locations that are already in use in app but give the same data

const NoWeeks = 8
const locationsWithParameters = [];

(async () => {

  const chunkSize = 1000 //Otherwise API will give "Ongeldig request" error / == max locations to fetch in one request
  for (let i = 0; i < locations.length; i += chunkSize) {

    const chunk = locations.slice(i, i + chunkSize);
    const response = await fetch("https://waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGENSERVICES_DBO/OphalenLaatsteWaarnemingen/", getRequestOptions(chunk))
    const data = await response.json()

    if (data.Succesvol) {
      for (let j = 0; j < data.WaarnemingenLijst.length; j++) {
        if (data.WaarnemingenLijst[j].AquoMetadata.Grootheid.Code == "WINDSHD") {

          const timeStamp = parseISO(data.WaarnemingenLijst[j].MetingenLijst[0].Tijdstip)
          const differenceWeeks = differenceInWeeks(new Date(), timeStamp)

          if (differenceWeeks < NoWeeks)
            if (!locationsInKNMIAPI.includes(data.WaarnemingenLijst[j].Locatie.Code))
              if (!locationsDouble.includes(data.WaarnemingenLijst[j].Locatie.Code))
                locationsWithParameters.push(data.WaarnemingenLijst[j].Locatie.Code)
        }
      }
    }

  }
  console.log("Rijkswaterstaat locations in use in app: ")
  console.log(locationsInApp.sort())
  console.log(`Rijkswaterstaat locations in API that have data for windspeed in the past ${NoWeeks} weeks:`)
  console.log(locationsWithParameters.sort())

  const locationsInAppSet = new Set(locationsInApp)
  const locationsInAPINotInApp = locationsWithParameters.filter((name) => {
    return !locationsInAppSet.has(name)
  })
  console.log(`Rijkswaterstaat locations that are in API but NOT in use in app: ${locationsInAPINotInApp}`)
  console.log("Here are the location objects for testing to see if worth adding:")

  for (let i = 0; i < locationsInAPINotInApp.length; i++) {

    let j;
    for (j = 0; j < locations.length; j++)
      if (locations[j].Code == locationsInAPINotInApp[i]) break

    const object = {
      x: locations[j].X,
      y: locations[j].Y,
      lat: transform.forward({ x: locations[j].X, y: locations[j].Y }).y,
      lon: transform.forward({ x: locations[j].X, y: locations[j].Y }).x,
      datasets: {
        Rijkswaterstaat: {
          location_id: locations[j].Code
        }
      },
      name: `TEST ${i}`
    }

    console.log(`"123${i}":`)
    console.log(JSON.stringify(object, null, 2))
  }

  console.log("Copy / paste this only if less than 10 objects printed, do still add comma's")

})()






function getRequestOptions(chunk) {
  return {
    "method": "POST",
    "headers": {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },

    "body": JSON.stringify({
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
      "LocatieLijst": chunk
    })
  }
}

function parseLocationsInApp() {
  const locations = []
  const file = "../../locations.json"

  const data = JSON.parse(readFileSync(file))

  Object.entries(data).forEach((location) => {
    const dataSet = Object.keys(location[1].datasets)[0]

    if (dataSet == "Rijkswaterstaat") {
      locations.push(location[1].datasets.Rijkswaterstaat.location_id)
    }
  })

  return locations
}