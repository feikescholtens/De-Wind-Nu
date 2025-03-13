import { readFileSync } from "fs"
import { SecretManagerServiceClient } from "@google-cloud/secret-manager"
const client = new SecretManagerServiceClient()
import fetch from "node-fetch"
import express from "express"
import cors from "cors"
import path from "path"
import { format } from "date-fns"
import module from "date-fns-tz"
const { utcToZonedTime } = module
import nodemailer from "nodemailer"






export async function setEnvironmentVariables(app) {

  // From dotenv on localhost, if not on localhost, load env's from Google Secret Manager
  if (global.port == 3000) {
    const dotenv = await import("dotenv")
    dotenv.config()
  } else {
    const promises = [] //Used to keep track of the promises, so that when all environmental variables are fetched, the forecast can be fetched
    const placeHolderVariable = ["GCP_CLIENT_EMAIL", "GCP_PRIVATE_KEY", "GMAIL_APP_KEY", "MVB_PWD_ENCODED", "IPQUALITYSCORE_KEY", "KDP_EDR_KEY"].forEach((identifier) => promises.push(setEnvironmentVariableFromGoogleSecretManager(identifier)))
  }

}








export async function setEnvironmentVariableFromGoogleSecretManager(identifier) {
  const name = `projects/de-wind-nu/secrets/${identifier}/versions/latest`
  const promiseVersion = client.accessSecretVersion({ name: name })

  const [version] = await promiseVersion
  const payload = version.payload.data.toString()

  process.env[identifier] = payload

  return promiseVersion
}












export function setGlobalVariables() {
  global.MVBAPIKey = {}
  global.port = process.env.PORT || 3000
  global.serverTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  global.userTimeZone = "Europe/Amsterdam"

  // Extend the Array prototype with a custom copy function
  global.extendPrototypes = (() => Array.prototype.customCopy = function() { return JSON.parse(JSON.stringify(this)) })()
}









export function getActiveLocations() {
  // Get the active locations from the locations.json file and return them as an object
  const locations = JSON.parse(readFileSync("locations.json"))
  const activeLocations = Object.entries(locations).filter(([key, value]) => value.active)
  const locationsObject = Object.fromEntries(activeLocations)
  const locationsObjectString = JSON.stringify(locationsObject)

  return [locationsObject, locationsObjectString]
}













export function initializeExpress() {
  const app = express()
  const __dirname = path.resolve()

  // Configure express
  app.use(express.json({ limit: "500kb" }))
  app.set("view-engine", "ejs")
  app.set("trust proxy", true)

  // Static files router
  app.use("/", express.static(path.resolve(__dirname, "public/dist/homepage")))
  app.use("/wind/", express.static(path.resolve(__dirname, "public/dist/windPage")))

  app.use("/images", cors(), express.static(path.resolve(__dirname, "public/assets")))
  app.use("/robots.txt", cors(), express.static(path.resolve(__dirname, "public/assets/robots.txt")))

  if (global.port == 3000) app.use("/src", express.static(path.resolve(__dirname, "public/src"))) //Needed for sourcemaps

  // Start the server on the specified port and log that the server is running
  app.listen(global.port, () => log(`server running at port ${global.port}`, "info"))

  return app
}










const consoleColours = {
  "debug": "\x1b[94m%s\x1b[0m",
  "error": "\x1b[91m%s\x1b[0m",
  "fetchError": "\x1b[95m%s\x1b[0m",
  "info": "\x1b[93m%s\x1b[0m"
}

export function log(message, type = "debug", addLocalDate) {
  let dateTime = format(utcToZonedTime(new Date(), global.userTimeZone), "dd-MM-yyyy HH:mm") + " (CET/CEST): "

  if (addLocalDate) message = dateTime += message
  console.log(consoleColours[type], message)
}











export function getLocationListParsingHarmonie(request, response, locations) {

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

}








const regex = /\\n|\\r\\n|\\n\\r|\\r/g

export async function addFeedback(request, response) {

  //Set variables
  const data = request.body
  const name = data.name.replaceAll("\"", "")
  let subject = "Nieuwe feedback"
  if (name !== "") subject += ` van ${name}`
  const mailOptions = {
    from: '"Website" <dewindnu@gmail.com>',
    to: "dewindnu@gmail.com",
    subject: subject,
    html: `<h1>Nieuwe feedback</h1>
    <table border="1px">
      <tr>
        <td>Naam:</td>
        <td>${name}</td>
      </tr>
      <tr>
        <td>E-mail:</td>
        <td>${data.email.replaceAll("\"", "")}</td>
      </tr>
      <tr>
        <td>Bericht:</td>
        <td>${data.message.replaceAll(regex, "<br>").replaceAll("\"", "")}</td>
      </tr>
    </table>`
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "dewindnu@gmail.com",
      pass: process.env.GMAIL_APP_KEY
    }
  })

  //Send email to my email address
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) log(error, "error")
    else response.send(info.response.substring(0, 12))
  })

}












//Homepage
export async function getClientIPLocation(request, response) {
  let clientIP = request.ip
  if (global.port == 3000) clientIP = process.env.DEVELOPMENT_PUBLIC_IP_SERVER

  const IPQualityScore = await fetch(`https://ipqualityscore.com/api/json/ip/${process.env.IPQUALITYSCORE_KEY}/${clientIP}?strictness=0&allow_public_access_points=true&fast=true&lighter_penalties=true&mobile=true`)
    .catch(error => {
      console.log(error)
      response.json({ "success": false })
      return
    })
    .then(responseIP => { return responseIP.json() })

  if (IPQualityScore.fraud_score == 0) response.json({ "success": true, "lowEnoughIPScore": true, "lat": IPQualityScore.latitude, "lon": IPQualityScore.longitude })
  else response.json({ "success": true, "lowEnoughIPScore": false })
}













//Windpage
export function isExistingLocation(checkID, locations, response) {

  if (locations[checkID] == undefined) { response.json({ errorCode: 400 }); return false }
  return true

}