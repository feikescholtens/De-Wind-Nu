//Import dependencies
import express from "express";
import path from "path"
import { readFileSync } from "fs";
import { getData } from "./getData.js"
import { addLocation } from "./addLocation.js"
import { addFeedback } from "./addFeedback.js"

const __dirname = path.resolve();

//Define variables
const app = express();
const port = process.env.PORT || 3000;
const locations = JSON.parse(readFileSync("locations.json"));

//Initialize Express
app.listen(port, () => console.log("server running at port " + port));
app.use(express.static('public'));
app.use(express.json({ limit: '500kb' }));
app.use("/wind/", express.static(path.resolve(__dirname, "public", "wind_page")));
app.set("view-engine", "ejs")
app.set("views", path.join(__dirname, "/public/wind_page/"))

//Add location API and DOTENV, only on localhost
if (port == 3000) {
  const dotenv = await import("dotenv");
  dotenv.config()

  app.post("/addLocation", (request) => addLocation(request, locations));
}

//Serve location data API
app.get("/locations", (request, response) => response.json(locations));

//Server wind page API
app.get("/wind/:id", async (request, response) => {
  const dateText = await getData(request, response, locations)
  const data = JSON.stringify(dateText)

  response.render("index.ejs", { data })
});

//Add data to database when feedback received
app.post("/addFeedback", (request, response) => addFeedback(request, response))

//If unknown url is typed in
app.use("/*", (request, response) => response.redirect("/"));