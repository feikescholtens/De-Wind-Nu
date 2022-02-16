//Import dependencies
import express from "express"
import path from "path"
import cors from "cors"
import { readFileSync } from "fs"
import { getData } from "./getData.js"
import { getOverviewData } from "./getOverviewData.js"
import { getForecast, deleteForecastYesterday } from "./forecastFunctions.js"
import { addLocation } from "./addLocation.js"
import { addFeedback } from "./addFeedback.js"
import { parseISO, add } from "date-fns"
import schedule from "node-schedule"
import { log } from "./globalFunctions.js"
global.log = log

//Define variables
const __dirname = path.resolve()
const app = express()
const port = process.env.PORT || 3000
const locations = JSON.parse(readFileSync("locations.json"))
const locationsString = JSON.stringify(locations)
let forecastData = JSON.parse(readFileSync("forecastData.json"))
const ruleNewForecast = new schedule.RecurrenceRule()
ruleNewForecast.hour = [3, 9, 15, 30, 21]
ruleNewForecast.minute = 59
ruleNewForecast.tz = "Europe/Amsterdam"
const ruleDelOldForecast = new schedule.RecurrenceRule()
ruleDelOldForecast.hour = 0
ruleDelOldForecast.minute = 44
ruleDelOldForecast.tz = "Europe/Amsterdam"

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
app.use("/forecastData.json", express.static(path.resolve(__dirname, "forecastData.json")))

app.set("view-engine", "ejs")
app.set("views", path.join(__dirname, "/public/windPage/"))

//Add location API and DOTENV, only on localhost
if (port == 3000) {
  const dotenv = await import("dotenv")
  dotenv.config()

  app.post("/addLocation", (request) => addLocation(request, locations))

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

//If unknown url is typed in
app.use("/*", (request, response) => response.redirect("/"))

//Fetching forecast data (all times here in UTC)
if (Object.keys(forecastData).length == 0) {
  callGetForecast(forecastData)
} else if (!forecastData.timeRun) {
  callGetForecast(forecastData)
} else {
  const timeStampRun = parseISO(`${forecastData.timeRun}Z`)
  const timeNewRunAvailable = add(timeStampRun, { hours: (2 + 6), minutes: 59 })

  if (new Date() > timeNewRunAvailable) {

    log(new Date(), "debug", true)
    log(timeNewRunAvailable, "debug", true)

    callGetForecast(forecastData)
  }
}

schedule.scheduleJob(ruleNewForecast, () => {
  callGetForecast(forecastData)
})

async function callGetForecast() {
  const response = await new Promise(async (resolve) => {
    getForecast(forecastData, resolve)
  })
  if (response !== "ENOTAVAILABLE") forecastData = response
}

//Deleting forecast data from yesterday
schedule.scheduleJob(ruleDelOldForecast, async () => { forecastData = await deleteForecastYesterday(forecastData) });
(async () => { forecastData = await deleteForecastYesterday(forecastData) })()