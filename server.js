//Import dependencies
import express from "express"
import path from "path"
import { readFileSync } from "fs"
import { getData } from "./getData.js"
import { addLocation } from "./addLocation.js"
import { addFeedback } from "./addFeedback.js"

//Define variables
const __dirname = path.resolve()
const app = express()
const port = process.env.PORT || 3000
const locations = JSON.parse(readFileSync("locations.json"))
const locationsString = JSON.stringify(locations)

//Initialize Express
app.listen(port, () => console.log("server running at port " + port))
app.use(express.json({ limit: "500kb" }))

app.use("/", express.static(path.resolve(__dirname, "public/homepage")))
app.use("/wind/", express.static(path.resolve(__dirname, "public/windPage")))
app.use("/error", express.static(path.resolve(__dirname, "public/errorPage")))

app.use("/jsPopUps", express.static(path.resolve(__dirname, "public/jsPopUps")))
app.use("/images", express.static(path.resolve(__dirname, "public/images")))
app.use("/generalStyles.css", express.static(path.resolve(__dirname, "public/generalStyles.css")))


app.set("view-engine", "ejs")
app.set("views", path.join(__dirname, "/public/windPage/"))

//Add location API and DOTENV, only on localhost
if (port == 3000) {
  const dotenv = await import("dotenv")
  dotenv.config()

  app.post("/addLocation", (request) => addLocation(request, locations))
}

//Homepage API
app.get("/", (request, response) => response.render(path.join(__dirname, "/public/homepage/index.ejs"), { locationsString }))

//Server wind page API
app.get("/wind/:id", async (request, response) => {
  const dataText = await getData(request, response, locations)
  const data = JSON.stringify(dataText)

  if (data) response.render(path.join(__dirname, "/public/windPage/index.ejs"), { data })
});

//Add data to database when feedback received
app.post("/addFeedback", (request, response) => addFeedback(request, response))

//If unknown url is typed in
app.use("/*", (request, response) => response.redirect("/"));