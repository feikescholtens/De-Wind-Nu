//Import dependencies
const express = require("express");
const path = require("path");
const fs = require("fs");

require("dotenv").config();
const {
  fetchData
} = require("./fetchData")
const {
  getData
} = require("./getData");
const {
  addLocation
} = require("./addLocation")
const {
  addFeedback
} = require("./addFeedback");

//Define variables
const app = express();
const port = process.env.PORT || 3000;
const locations = JSON.parse(fs.readFileSync("locations.json"));

//Initialize Express
app.listen(port, () => console.log("server running at port " + port));
app.use(express.static('public'));
app.use("/wind", express.static(path.resolve(__dirname, "public", "wind_page")));
app.use(express.json({
  limit: '500kb'
}));

//Add location API, only on localhost
if (port == 3000) {
  app.post("/addLocation", (request, response) => addLocation(request, response, locations, fs));
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
  getData(request, response, locations, fetchData, fs);
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