//Import dependencies
import express from "express"
import path from "path"
import cors from "cors"
import { setEnvironmentVariable, getClientIPLocation } from "./serverFunctions.js"
import { readFileSync } from "fs"
import { getData } from "./getData.js"
import { getOverviewData } from "./getOverviewData.js"
import { addFeedback } from "./addFeedback.js"
import { log } from "./globalFunctions.js"
import schedule from "node-schedule"
import { createRecurrenceRule, scheduledGetForecast, firestoreAuth } from "./forecastFunctions.js"
import { Firestore } from "@google-cloud/firestore"
import { getLocationListParsingHarmonie } from "./developmentFunctions.js"
global.log = log
global.MVBAPIKey = {}
global.port = process.env.PORT || 3000
global.forecastData = {}

//Define variables
const __dirname = path.resolve()
const app = express()
let locations = Object.fromEntries(Object.entries(JSON.parse(readFileSync("locations.json"))).filter(([key, value]) => value.active)) //Way too long line I know, but the only thing it does is read the locations that are active.
// const locationsWTZ = JSON.parse(readFileSync("projectFiles/WTZ/3. output.json")) //Show locations WTZ viewer that have currents (parameter "SG")
// locations = { ...locations, ...locationsWTZ }
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
app.set("trust proxy", true)

//DOTENV and devTools routes, only on localhost, if not on localhost, load env's from Google Secret Manager
if (port == 3000) {
  const dotenv = await import("dotenv")
  dotenv.config()
  fetchForecast()

  app.get("/devTools/giveLocationsParsingHarmonie", (request, response) => getLocationListParsingHarmonie(request, response, locations))
} else {
  const promises = [] //Used to keep track of the promises, so that when all environmental variables are fetched, the forecast can be fetched
  const placeHolderVariable = ["GCP_CLIENT_EMAIL", "GCP_LOGGER_KEY", "GCP_PRIVATE_KEY", "GMAIL_APP_KEY", "MVB_PWD_ENCODED", "IPQUALITYSCORE_KEY"].forEach((identifier) => promises.push(setEnvironmentVariable(identifier)))
  Promise.all(promises).then(() => fetchForecast())
}

//ROUTES ---------------------------------------------------------------------------------------------------

//Homepage & windpage
app.get("/", (request, response) => response.render(path.join(__dirname, "/public/homepage/index.ejs"), { locationsString }))
app.get("/getClientIPLocation", (request, response) => getClientIPLocation(request, response))
app.get("/wind/:id", (request, response) => {
  if (!locations[request.params.id]) { response.redirect("/"); return }
  const spotName = locations[request.params.id].name
  response.render(path.join(__dirname, "/public/windPage/index.ejs"), { spotName })
})
app.get("/1984", (request, response) => response.redirect("/wind/8700"))

//Data API's
app.get("/getData/:id", (request, response) => getData(request, response, request.query.date, locations, forecastData))
app.get("/getOverviewData/:dataSource", (request, response) => getOverviewData(request, response, locations))

//Mail developer (me! :)) once feedback received
app.post("/addFeedback", (request, response) => addFeedback(request, response))

//Logs message from GCP console
app.post("/logGCPMessage", (request, response) => {
  if (request.headers.authorization !== process.env.GCP_LOGGER_KEY) { response.status(403).json(); return }

  const message = request.body.message,
    type = request.body.type,
    addTimeStamp = request.body.addTimeStamp

  log(message, type, addTimeStamp)
  response.json()
})

//If unknown url is typed in
app.use("/*", (request, response) => response.redirect("/"))

//------------------------------------------------------------------------------------------------------

//Load forecast (timing dependend on local / remote runtime) and schedule updates
async function fetchForecast() {
  const firestore = new Firestore(firestoreAuth())
  forecastData = await (await firestore.doc("Harmonie forecast today & future/document").get()).data() || {}
}

const ruleUpdatedForecast = createRecurrenceRule([2, 8, 14, 20, 19], [55, 21], [30])
schedule.scheduleJob(ruleUpdatedForecast, async () => { scheduledGetForecast(16) })