// Import dependencies
import { getClientIPLocation, getActiveLocations, initializeExpress, setGlobalVariables, setEnvironmentVariables } from "./serverFunctions.js"
import { getData } from "./getData.js"
import { getOverviewData } from "./getOverviewData.js"
import { addFeedback } from "./serverFunctions.js"
import { getLocationListParsingHarmonie } from "./serverFunctions.js"
import path from "path"

// Define variables
setGlobalVariables()
const __dirname = path.resolve()
const [locations, locationsString] = getActiveLocations()

//Initialize Express
const app = initializeExpress()

// Set environment variables
setEnvironmentVariables(app)

// Routes for homepage & windpage (routes for static files are in the initializeExpress function)
app.get("/", (req, res) => res.render(path.join(__dirname, "/public/dist/homepage/index.ejs"), { locationsString }))
app.get("/getClientIPLocation", (req, res) => getClientIPLocation(req, res))

app.get("/wind/:id", (req, res) => {
  if (locations[req.params.id] == undefined) { res.redirect("/"); return }
  const spotName = locations[req.params.id].name
  res.render(path.join(__dirname, "/public/dist/windPage/index.ejs"), { spotName })
})
app.get("/1984", (req, res) => res.redirect("/wind/8700"))

// Routes for data API's
app.get("/getData/:id", (req, res) => getData(req, res, req.query.date, locations))
app.get("/getOverviewData/:dataSource", (req, res) => getOverviewData(req, res, locations))
app.get("/giveLocationsParsingHarmonie", (req, res) => getLocationListParsingHarmonie(req, res, locations))

// Route for feedback
app.post("/addFeedback", (req, res) => addFeedback(req, res))

// Route for unknown URLs
app.use("/*", (req, res) => res.redirect("/"))