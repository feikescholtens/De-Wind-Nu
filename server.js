//Import dependencies
import express from "express"
import path from "path"
import cors from "cors"
import { readFileSync } from "fs"
import { getData } from "./getData.js"
import { getOverviewData } from "./getOverviewData.js"
import { addLocation } from "./addLocation.js"
import { addFeedback } from "./addFeedback.js"
import { log } from "./globalFunctions.js"
import { Storage } from "@google-cloud/storage"
import schedule from "node-schedule"
global.log = log

//Define variables
const __dirname = path.resolve()
const app = express()
const port = process.env.PORT || 3000
const locations = JSON.parse(readFileSync("locations.json"))
const locationsString = JSON.stringify(locations)

//Initialize Express
app.listen(port, () => log(`server running at port ${port}`, "info"))
app.use(express.json({ limit: "500kb" }))

app.use("/", express.static(path.resolve(__dirname, "public/homepage")))
app.use("/wind/", express.static(path.resolve(__dirname, "public/windPage")))
app.use("/error", express.static(path.resolve(__dirname, "public/errorPage")))

app.use("/jsPopUps", express.static(path.resolve(__dirname, "public/jsPopUps")))
app.use("/images", cors(), express.static(path.resolve(__dirname, "public/images")))
app.use("/generalStyles.css", express.static(path.resolve(__dirname, "public/generalStyles.css")))
app.use("/redirect.js", express.static(path.resolve(__dirname, "public/redirect.js")))

app.set("view-engine", "ejs")
app.set("views", path.join(__dirname, "/public/windPage/"))

//Add location API and DOTENV, only on localhost
if (port == 3000) {
  const dotenv = await import("dotenv")
  dotenv.config()

  app.post("/addLocation", (request) => addLocation(request, locations))
  app.get("/devTools/giveLocationsGCP", (request, response) => {
    let locationsGCP = []
    for (let i = 0; i < locations.length; i++) {
      locationsGCP.push({
        id: locations[i].id,
        lat: parseFloat(parseFloat(locations[i].lat).toFixed(4)),
        lon: parseFloat(parseFloat(locations[i].lon).toFixed(4))
      })
    }
    response.json(locationsGCP)
  })

  app.use("/devTools/addLocation", express.static(path.resolve(__dirname, "public/devTools/addLocation")))
  app.use("/devTools/stations", express.static(path.resolve(__dirname, "public/devTools/stations")))
  app.use("/devTools/compareKNMI&RWS", express.static(path.resolve(__dirname, "public/devTools/compareKNMI&RWS")))
}

//Homepage API
app.get("/", (request, response) => response.render(path.join(__dirname, "/public/homepage/index.ejs"), { locationsString }))

//Server wind page API
app.get("/wind/:id", async (request, response) => {
  const dataText = await getData(request, response, locations, forecastData)
  const data = JSON.stringify(dataText)

  if (data) response.render(path.join(__dirname, "/public/windPage/index.ejs"), { data })
})

//Overview API
app.get("/getOverviewData/:dataSource", (request, response) => getOverviewData(request, response, locations))

//Add data to database when feedback received
app.post("/addFeedback", (request, response) => addFeedback(request, response))

//Logs message from GCP console
app.post("/logGCPMessage", (request, response) => {
  if (request.headers.authorization !== process.env.GCP_LOGGER_KEY) {
    response.status(403).json()
    return
  }

  const message = request.body.message
  const type = request.body.type
  const addTimeStamp = request.body.addTimeStamp

  log(message, type, addTimeStamp)
  response.status(200).json()
})

//Inspecting forecast data
app.use("/forecast*", (request, response) => response.json(forecastData))

//If unknown url is typed in
app.use("/*", (request, response) => response.redirect("/"))

//Load forecast and schedule updates
let forecastData = {};
(async () => forecastData = await fetchForecast())()

const ruleUpdatedForecast = createRecurrenceRule([3, 9, 15, 21], [55], [30])
schedule.scheduleJob(ruleUpdatedForecast, async () => { scheduledGetForecast(11) })

//--------------Some functions-------------------------------------------------------------------------------------
//Make and return a recurrence rule
function createRecurrenceRule(hours, minutes, seconds) {
  const rule = new schedule.RecurrenceRule()
  rule.hour = hours
  rule.minute = minutes
  rule.second = seconds
  rule.tz = "Europe/Amsterdam"
  return rule
}

//Function that schedules fetching forecast
async function scheduledGetForecast(NoTries) {
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

//Function for fetching forecast itself 
async function fetchForecast() {

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