import { Storage } from "@google-cloud/storage"
import { Firestore } from "@google-cloud/firestore"
import { format, subDays, differenceInCalendarDays, parse, parseISO } from "date-fns"
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
  let forecastData = await downloadData().catch(console.error)

  let firstDates = []
  for (const [key, value] of Object.entries(forecastData)) {
    if (key !== "timeRun") firstDates.push(parse(value[0].date, "dd-MM-yyyy", new Date()).toISOString())
  }

  firstDates.sort()
  let NoDaysToArchive = differenceInCalendarDays(utcToZonedTime(new Date(), timeZone), utcToZonedTime(parseISO(firstDates[0]), timeZone))
  let postSplit, preSplit

  while (NoDaysToArchive > 0) {
    const dateArchive = format(utcToZonedTime(subDays(new Date(), NoDaysToArchive), timeZone), "dd-MM-yyyy")
    const dateAfterArchive = format(utcToZonedTime(subDays(new Date(), NoDaysToArchive - 1), timeZone), "dd-MM-yyyy")

    forecastData = postSplit || forecastData;
    [postSplit, preSplit] = splitForecastData(forecastData, dateAfterArchive)

    //Saving archived forecast
    if (Object.keys(preSplit).length > 1) {
      const firestore = new Firestore({
        projectId: process.env.GCP_PROJECT_ID,
      })
      firestore.doc(`Harmonie forecast archive/${dateArchive}`).set(preSplit)
      logNodeApp(`Archived forecast data from ${dateArchive}!`, "info", true)
    }

    NoDaysToArchive--
  }

  //Saving forecast for today and future
  const fileExists = await storage.bucket("de-wind-nu").file("forecastData.json").exists()
  if (fileExists[0]) storage.bucket("de-wind-nu").file("forecastData.json").rename("forecastData.old.json")

  const uploadBuffer = Buffer.from(JSON.stringify(postSplit))

  storage.bucket("de-wind-nu").file("forecastData.new.json").save(uploadBuffer)
    .then(() => {
      logNodeApp("Removed forecast data from (before) yesterday from JSON (errors while saving might still have occured)!", "info", true)
      storage.bucket("de-wind-nu").file("forecastData.new.json").rename("forecastData.json")
    })

  //Function for splitting the forecast data
  function splitForecastData(forecastData, dateAfterArchive) {

    let postSplit = {},
      preSplit = {}

    if (Object.keys(forecastData).length <= 1) return forecastData

    //Working in local times
    for (let i = 0; i < Object.keys(forecastData).length; i++) {
      if (Object.keys(forecastData)[i] !== "timeRun") {

        const splitIndex = forecastData[Object.keys(forecastData)[i]].findIndex(location => location.time == "00:00" && location.date == dateAfterArchive) //Equals the No. hours to take away
        if (splitIndex !== -1) {

          postSplit[Object.keys(forecastData)[i]] = forecastData[Object.keys(forecastData)[i]].slice(splitIndex)

          if (forecastData[Object.keys(forecastData)[i]].slice(0, splitIndex + 1).length > 1) {
            preSplit[Object.keys(forecastData)[i]] = forecastData[Object.keys(forecastData)[i]].slice(0, splitIndex + 1)
          }

        }
      }
    }

    postSplit.timeRun = preSplit.timeRun = forecastData.timeRun

    return [postSplit, preSplit]
  }

}