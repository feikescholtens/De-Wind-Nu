import schedule from "node-schedule"
import { Firestore } from "@google-cloud/firestore"

export function firestoreAuth() {
  return {
    projectId: "de-wind-nu",
    credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY
    }
  }
}

export function createRecurrenceRule(hours, minutes, seconds) {
  const rule = new schedule.RecurrenceRule()
  rule.hour = hours
  rule.minute = minutes
  rule.second = seconds
  rule.tz = "Etc/UTC"
  return rule
}

export async function scheduledGetForecast(NoTries) {
  const firestore = new Firestore(firestoreAuth())

  let tryCount = 0
  await getNewForecast()

  async function getNewForecast() {
    tryCount++
    const newForecast = await (await firestore.doc("Harmonie forecast today & future v2/document").get()).data()
    if (newForecast.timeRun == forecastData.timeRun) {
      if (tryCount < NoTries) {
        setTimeout(() => { getNewForecast() }, 60 * 1000)
      }
    } else {
      forecastData = newForecast
    }
  }
}