import schedule from "node-schedule"
import { Storage } from "@google-cloud/storage"

export function createRecurrenceRule(hours, minutes, seconds) {
  const rule = new schedule.RecurrenceRule()
  rule.hour = hours
  rule.minute = minutes
  rule.second = seconds
  return rule
}

export async function scheduledGetForecast(NoTries) {
  let tryCount = 0
  await getNewForecast()

  async function getNewForecast() {
    tryCount++

    const newForecast = await fetchForecast()
    if (newForecast.timeRun == forecastData.timeRun) {
      if (tryCount < NoTries) {
        setTimeout(() => { getNewForecast() }, 60 * 1000)
      }
    } else {
      forecastData = newForecast
    }
  }
}

export async function fetchForecast() {

  const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY
    }
  })

  const fileExists = await storage.bucket("de-wind-nu").file("forecastData.json").exists()
  if (!fileExists[0]) return {}

  const newForecast = await new Promise(async resolve => {
    const stream = await storage.bucket("de-wind-nu").file("forecastData.json").createReadStream()

    let buffer = ""
    stream.on("data", (data) => {
      buffer += data
    }).on('end', () => {
      resolve(JSON.parse(buffer))
    })

  })

  return newForecast
}