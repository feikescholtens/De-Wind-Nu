//Import dependencies
import express from "express"
import path from "path"
import cors from "cors"
import { readFileSync } from "fs"
import { getData } from "./getData.js"
import { getOverviewData } from "./getOverviewData.js"
import { addFeedback } from "./addFeedback.js"
import { log } from "./globalFunctions.js"
import schedule from "node-schedule"
import { createRecurrenceRule, scheduledGetForecast, firestoreAuth } from "./forecastFunctions.js"
import { Firestore } from "@google-cloud/firestore"
import { SecretManagerServiceClient } from "@google-cloud/secret-manager"
global.log = log
global.MVBAPIKey = {}
global.port = process.env.PORT || 3000

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

//DOTENV and devTools routes, only on localhost, if not on localhost, load env's from Google Secret Manager
if (port == 3000) {
  const dotenv = await import("dotenv")
  dotenv.config()

  fetchForecast()

  app.get("/devTools/giveLocationsGCP", (request, response) => {
    let locationsGCP = []
    const locationsArray = Object.entries(locations)
    for (let i = 0; i < locationsArray.length; i++) {
      locationsGCP.push({
        id: locationsArray[i][0],
        lat: parseFloat(parseFloat(locationsArray[i][1].lat).toFixed(4)),
        lon: parseFloat(parseFloat(locationsArray[i][1].lon).toFixed(4))
      })
    }
    response.json(locationsGCP)
  })

  app.use("/devTools/stations", express.static(path.resolve(__dirname, "public/devTools/stations")))
  app.use("/devTools/compareKNMI&RWS", express.static(path.resolve(__dirname, "public/devTools/compareKNMI&RWS")))
} else {
  const client = new SecretManagerServiceClient()

  const promises = [] //Used to keep track of the promises, so that when all environmental variables are fetched, the forecast can be fetched
  async function setEnvironmentVariable(identifier) {
    const name = `projects/de-wind-nu/secrets/${identifier}/versions/latest`
    const promiseVersion = client.accessSecretVersion({ name: name })
    promises.push(promiseVersion)
    const [version] = await promiseVersion
    const payload = version.payload.data.toString()

    process.env[identifier] = payload
  }

  ["APP_EMAIL", "GCP_CLIENT_EMAIL", "GCP_LOGGER_KEY", "GCP_PRIVATE_KEY", "GCP_PROJECT_ID", "GMAIL_APP_KEY", "MVB_PWD_ENCODED"].forEach((identifier) => setEnvironmentVariable(identifier))
  Promise.all(promises).then(() => fetchForecast())
}



//Homepage & windpage
app.get("/", (request, response) => response.render(path.join(__dirname, "/public/homepage/index.ejs"), { locationsString }))
app.get("/wind/:id", (request, response) => {
  if (!locations[request.params.id]) { response.redirect("/"); return }
  const spotName = locations[request.params.id].name
  response.render(path.join(__dirname, "/public/windPage/index.ejs"), { spotName })
})
app.get("/1984", (request, response) => response.redirect("/wind/8700"))

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

//Load forecast (timing dependend on local / remote runtime) and schedule updates
global.forecastData = {}
async function fetchForecast() {
  const firestore = new Firestore(firestoreAuth());
  forecastData = await (await firestore.doc("Harmonie forecast today & future/document").get()).data() || {}
}

const ruleUpdatedForecast = createRecurrenceRule([2, 8, 14, 20, 19], [55, 21], [30])
schedule.scheduleJob(ruleUpdatedForecast, async () => { scheduledGetForecast(16) })