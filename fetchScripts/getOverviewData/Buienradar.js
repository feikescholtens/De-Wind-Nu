import fetch from "node-fetch"
import { parseISO, addHours, subHours } from "date-fns"
import { getTimeChangeDates } from "../../getScriptUtilFunctions.js"

export async function overviewFetchBuienradar(locations, resolve) {

  let IDMatches = []
  for (const id in locations) {
    if (Object.keys(locations[id].datasets)[0] == "KNMI") {
      IDMatches.push({
        applicationID: id,
        Buienradar: locations[id].datasets.KNMI.location_id,
      })
    }
  }

  const rawDataString = await fetch("https://data.buienradar.nl/2.0/feed/json")
    .then(response => response.text())

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }

  let data = {}

  rawData.actual.stationmeasurements.forEach(locationData => {

    //Match reveived location with one from own list to get application ID for each location
    for (let i = 0; i < IDMatches.length; i++) {
      if (IDMatches[i].Buienradar == locationData.stationid) {

        //Timezone offset needs to be determined by looking at when CEST ends and begins, thanks for not including it in the API Buienradar
        const dateLocalTimeZone = parseISO(locationData.timestamp),
          DSTDates = getTimeChangeDates(parseISO(locationData.timestamp))
        DSTDates.toDST = addHours(DSTDates.toDST, 2)
        DSTDates.fromDST = addHours(DSTDates.fromDST, 3)
        let timeZoneHours
        if (dateLocalTimeZone >= DSTDates.toDST && dateLocalTimeZone < DSTDates.fromDST) timeZoneHours = 2
        else timeZoneHours = 1
        const dateUTC = parseISO(`${locationData.timestamp}+0${timeZoneHours}:00`)

        const windSpeed = locationData.windspeed * 1.94384449,
          windGusts = locationData.windgusts * 1.94384449,
          windDirection = locationData.winddirectiondegrees,
          timeStamp = dateUTC.toISOString()

        data[IDMatches[i].applicationID] = { windSpeed: windSpeed, windGusts: windGusts, windDirection: windDirection, timeStamp: timeStamp }

        break
      }
    }
  })

  resolve(data)
}