import { format, parseISO, add } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
import fetch from "node-fetch";
import { catchError, theoreticalMeasurements, SuccesvolFalseError } from "./fetchUtilFunctions.js"

const timeZone = "Europe/Amsterdam"

export async function fetchRWS(databaseData, resolve, times) {

  let data = []

  const locationID = databaseData.datasets.RWS_OFFICIAL.location_id
  const locationX = databaseData.x
  const locationY = databaseData.y
  const dateUTC = new Date()
  const dateZoned = utcToZonedTime(dateUTC, timeZone)
  const dateToday = format(dateZoned, "dd-MM-yyyy")
  const dateTodayFetch = format(dateZoned, "yyyy-MM-dd")
  const dateTomorrowFetch = format(add(dateZoned, { days: 1 }), "yyyy-MM-dd")
  const time = "00:00:00"

  const rawDataString = await fetch("https://waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGENSERVICES_DBO/OphalenWaarnemingen", {
    "headers": {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    "body": JSON.stringify({
      "AquoPlusWaarnemingMetadata": {
        "AquoMetadata": {
          "Compartiment": { "Code": "LT" },
          "Grootheid": { "Code": "WINDSHD" }
        }
      },
      "Locatie": { "X": locationX, "Y": locationY, "Code": `${locationID}` },
      "Periode": {
        "Begindatumtijd": `${dateTodayFetch}T${time}.000+01:00`,
        "Einddatumtijd": `${dateTomorrowFetch}T${time}.000+01:00`
      }
    }),
    "method": "POST"
  }).then(response => response.text()).catch((error) => catchError(resolve, data, error, "RWS"))

  let rawData
  try { rawData = JSON.parse(rawDataString) } catch { return }
  // rawData = JSON.parse(readFileSync("projectFiles/discontinuous test data MVB.json"))

  if (SuccesvolFalseError(rawData, data, resolve)) return

  //Declare variables
  let wind_speed = [],
    wind_gusts = [],
    wind_direction = []
  const date = new Array(times.length).fill(dateToday)
  const timeStamps = JSON.parse(JSON.stringify(times))

  if (rawData.WaarnemingenLijst[0].MetingenLijst.length == 0) return

  let measurementTimes = [],
    tempArray = []

  rawData.WaarnemingenLijst[0].MetingenLijst.forEach((measurement) => {
    let time = format(utcToZonedTime(parseISO(measurement.Tijdstip), timeZone), "HH:mm")
    measurementTimes.push(time)
  })

  times.forEach((timeStamp) => {
    if (!measurementTimes.includes(timeStamp)) {
      tempArray.push(-999)
      return
    }

    const indexTime = measurementTimes.indexOf(timeStamp);

    if (rawData.WaarnemingenLijst[0].MetingenLijst[indexTime]) {
      if (rawData.WaarnemingenLijst[0].MetingenLijst[indexTime].Meetwaarde) {
        if (rawData.WaarnemingenLijst[0].MetingenLijst[indexTime].Meetwaarde.Waarde_Numeriek) {
          if (rawData.WaarnemingenLijst[0].MetingenLijst[indexTime].Meetwaarde.Waarde_Numeriek == 999999999) {
            tempArray.push(-999)
          } else tempArray.push(rawData.WaarnemingenLijst[0].MetingenLijst[indexTime].Meetwaarde.Waarde_Numeriek)
        } else tempArray.push(-999)
      } else tempArray.push(-999)
    } else tempArray.push(-999)
  })

  const theoreticalMeasurementCount = theoreticalMeasurements(measurementTimes)

  for (let j = 0; j < (times.length - theoreticalMeasurementCount); j++) {
    tempArray.pop()
  }

  // if (measurementType.ID.includes("WC3")) wind_gusts = JSON.parse(JSON.stringify(tempArray)).map(x => x * 1.94384449)
  wind_speed = JSON.parse(JSON.stringify(tempArray)).map(x => x * 1.94384449)
  // if (measurementType.ID.includes("WRS")) wind_direction = JSON.parse(JSON.stringify(tempArray))


  timeStamps.splice(wind_speed.length)

  data["Rijkswaterstaat"] = [date, timeStamps, wind_speed, wind_gusts, wind_direction]
  resolve({ data })

}