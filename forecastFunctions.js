import schedule from "node-schedule"

export function firestoreAuth() {
  return {
    projectId: process.env.GCP_PROJECT_ID,
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
  let tryCount = 0
  await getNewForecast()

  async function getNewForecast() {
    tryCount++
    console.log("Fetching new forecast")
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