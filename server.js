// Import dependencies

import path from "node:path";
import { getData } from "./getData.js";
import { getOverviewData } from "./getOverviewData.js";
import {
	addFeedback,
	getActiveLocations,
	getClientIPLocation,
	getLocationListParsingHarmonie,
	initializeExpress,
	setEnvironmentVariables,
	setGlobalVariables,
} from "./serverFunctions.js";

// Define variables
setGlobalVariables();
const __dirname = path.resolve();
const [locations, locationsString] = getActiveLocations();

//Initialize Express
const app = initializeExpress();

// Set environment variables
setEnvironmentVariables();

// Routes for homepage & windpage (routes for static files are in the initializeExpress function)
app.get("/", (_, res) =>
	res.render(path.join(__dirname, "/public/dist/homepage/index.ejs"), { locationsString }),
);
app.get("/getClientIPLocation", (req, res) => getClientIPLocation(req, res));

app.get("/wind/:id", (req, res) => {
	if (locations[req.params.id] === undefined) {
		res.redirect("/");
		return;
	}
	const spotName = locations[req.params.id].name;
	res.render(path.join(__dirname, "/public/dist/windPage/index.ejs"), { spotName });
});
app.get("/1984", (_, res) => res.redirect("/wind/8700"));

// Routes for data API's
app.get("/getData/:id", (req, res) => getData(req, res, req.query.date, locations));
app.get("/getOverviewData/:dataSource", (req, res) => getOverviewData(req, res, locations));
app.get("/giveLocationsParsingHarmonie", (_, res) =>
	getLocationListParsingHarmonie(res, locations),
);

// Route for feedback
app.post("/addFeedback", (req, res) => addFeedback(req, res));

// Route for unknown URLs
app.use("_", (_, res) => res.redirect("/"));
