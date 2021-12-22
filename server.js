//Import dependencies
import express from "express";
import path from "path"
import {
  readFileSync
} from "fs";
import dotenv from "dotenv"

import {
  fetchData
} from "./fetchData.js"
import {
  getData
} from "./getData.js"
import {
  addLocation
} from "./addLocation.js"
import {
  addFeedback
} from "./addFeedback.js"

dotenv.config();
const __dirname = path.resolve();

//Define variables
const app = express();
const port = process.env.PORT || 3000;
const locations = JSON.parse(readFileSync("locations.json"));

//Initialize Express
app.listen(port, () => console.log("server running at port " + port));
app.use(express.static('public'));
app.use("/wind", express.static(path.resolve(__dirname, "public", "wind_page")));
app.use(express.json({
  limit: '500kb'
}));

//Add location API, only on localhost
if (port == 3000) {
  app.post("/addLocation", (request) => addLocation(request, locations));
}

//Serve location data API
app.get("/locations", (request, response) => {
  response.json(locations);
});

//Server wind page API
app.get("/wind/:id", (request, response) => {

  if (request.params.id !== "" && request.params.id.length == 4 && /^\d+$/.test(request.params.id) == true) {
    response.sendFile(path.resolve("public/wind_page", "index.html"));
  } else {
    response.redirect('/error?e=93');
  }
});

//Get data function / API and serve to the user
app.get("/getData/:id", async (request, response) => {
  getData(request, response, locations, fetchData);
});

//Add data to database when feedback received
app.post("/addFeedback", (request, response) => {
  addFeedback(request, response)
});

//If unknown url is typed in
app.use(function (response) {
  response.status(404);
  response.type('txt').send("URL niet gevonden!");
});