import { Storage } from "@google-cloud/storage"
import { format } from "date-fns"
import datefnsTZ from "date-fns-tz"
const { utcToZonedTime } = datefnsTZ
import fetch from "node-fetch"

const timeZone = "Europe/Amsterdam"
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
})

function logNodeApp(message, type, addTimeStamp) {
  console.log(message)

  fetch("https://dewindnu.nl/logGCPMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.GCP_LOGGER_KEY
      },
      body: JSON.stringify({
        message: `[GCP] ${message}`,
        type: type,
        addTimeStamp: addTimeStamp
      })
    })
    .catch(error => console.log(error))
}

export async function runFunc() {

  async function downloadData() {

    const fileExists = await storage.bucket("de-wind-nu").file("forecastData.json").exists()

    if (!fileExists[0]) return {}

    return new Promise(async resolve => {
      const stream = await storage.bucket("de-wind-nu").file("forecastData.json").createReadStream()

      let buffer = ""
      stream.on("data", (data) => {
        buffer += data
      }).on('end', () => {
        resolve(JSON.parse(buffer))
      })

    })
  }

  const forecastData = await downloadData().catch(console.error)

  const newForecastData = deleteForecastYesterday(forecastData)

  function deleteForecastYesterday(forecastData) {

    if (Object.keys(forecastData).length <= 1) return forecastData

    //Working in CET
    const dateToday = format(utcToZonedTime(new Date(), timeZone), "dd-MM-yyyy")

    for (let i = 0; i < Object.keys(forecastData).length; i++) {
      if (Object.keys(forecastData)[i] !== "timeRun") {

        const indexFirstForecastTimeToday = forecastData[Object.keys(forecastData)[i]].findIndex(location => location.time == "00:00" && location.date == dateToday) //Equals the No. hours to delete
        if (indexFirstForecastTimeToday !== -1) {
          for (let j = 0; j < indexFirstForecastTimeToday; j++) {
            forecastData[Object.keys(forecastData)[i]].shift()
          }
        }

      }
    }

    return forecastData
  }

  const fileExists = await storage.bucket("de-wind-nu").file("forecastData.json").exists()
  if (fileExists[0]) storage.bucket("de-wind-nu").file("forecastData.json").rename("forecastData.old.json")

  const uploadBuffer = Buffer.from(JSON.stringify(newForecastData))

  storage.bucket("de-wind-nu").file("forecastData.new.json").save(uploadBuffer, () => {
    logNodeApp("Removed forecast data from yesterday, errors saving file might still have occured!", "info", true)
    storage.bucket("de-wind-nu").file("forecastData.new.json").rename("forecastData.json")
  })
}