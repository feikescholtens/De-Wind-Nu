import { Firestore } from "@google-cloud/firestore"
import { format, subDays, differenceInCalendarDays, parse, parseISO } from "date-fns"
import datefnsTZ from "date-fns-tz"
const { utcToZonedTime } = datefnsTZ
import fetch from "node-fetch"

const timeZone = "Europe/Amsterdam"

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

  const firestore = new Firestore({
    projectId: "de-wind-nu"
  })

  let forecastData = await (await firestore.doc("Harmonie forecast today & future/document").get()).data()

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
      await firestore.doc(`Harmonie forecast archive/${dateArchive}`).set(preSplit).catch(error => console.log(error));
      logNodeApp(`Archived forecast data from ${dateArchive}!`, "info", true)
    } else {
      logNodeApp(`Not archiving ${dateArchive} since it has no data!`, "info", true)
    }

    NoDaysToArchive--
  }

  //Saving forecast for today and future
  await firestore.doc("Harmonie forecast today & future/document").delete().catch(error => console.log(error));
  await firestore.doc("Harmonie forecast today & future/document").set(postSplit).catch(error => console.log(error));
  logNodeApp(`Saved forecast data from today and the days after!`, "info", true)

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