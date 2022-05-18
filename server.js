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
import schedule from "node-schedule"
import { createRecurrenceRule, fetchForecast, scheduledGetForecast } from "./forecastFunctions.js"
global.log = log
global.MVBAPIKey = {}
global.port = process.env.PORT || 3000

//Define variables
const __dirname = path.resolve()
const app = express()
const locations = JSON.parse(readFileSync("locations.json"))
const locationsString = JSON.stringify(locations)

//Initialize Express
app.listen(port, () => log(`server running at port ${port}`, "info"))
app.use(express.json({ limit: "500kb" }))

app.use("/", express.static(path.resolve(__dirname, "public/homepage")))
app.use("/wind/", express.static(path.resolve(__dirname, "public/windPage")))

app.use("/jsPopUps", express.static(path.resolve(__dirname, "public/jsPopUps")))
app.use("/images", cors(), express.static(path.resolve(__dirname, "public/images")))
app.use("/generalStyles.css", express.static(path.resolve(__dirname, "public/generalStyles.css")))
app.use("/globalFunctions.js", express.static(path.resolve(__dirname, "public/globalFunctions.js")))

app.set("view-engine", "ejs")

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

//Homepage & windpage
app.get("/", (request, response) => response.render(path.join(__dirname, "/public/homepage/index.ejs"), { locationsString }))
app.get("/wind/:id", (request, response) => {
  const spotName = locations[request.params.id].name
  response.render(path.join(__dirname, "/public/windPage/index.ejs"), { spotName })
})

//Data API's
app.get("/getData/:id", (request, response) => getData(request, response, request.query.date, locations, forecastData))
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
  response.json()
})

app.get("/testTimeout", (request, response) => {})

//If unknown url is typed in
app.use("/*", (request, response) => response.redirect("/"))

//Load forecast and schedule updates
global.forecastData = {};
(async () => forecastData = await fetchForecast())()

const ruleUpdatedForecast = createRecurrenceRule([2, 8, 14, 20], [55], [30])
schedule.scheduleJob(ruleUpdatedForecast, async () => { scheduledGetForecast(16) })