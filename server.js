// Import dependencies

import path from "node:path";
import { getData } from "./getData.js";
import { getOverviewData } from "./getOverviewData.js";
import {
	addFeedback,
	getActiveLocations,
	getAnnouncementCached,
	getAnnouncementForAdmin,
	getClientIPLocation,
	getLocationListParsingHarmonie,
	initializeExpress,
	requireAdminAuth,
	saveAnnouncement,
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
app.get("/", async (_, res) => {
	const announcementHtml = await getAnnouncementCached();
	res.render(path.join(__dirname, "/public/dist/homepage/index.ejs"), {
		locationsString,
		announcementHtml,
	});
});
app.get("/getClientIPLocation", (req, res) => getClientIPLocation(req, res));

app.get("/wind/:id", async (req, res) => {
	const spotName = locations[req.params.id]?.name;
	const announcementHtml = await getAnnouncementCached();
	res.render(path.join(__dirname, "/public/dist/windPage/index.ejs"), {
		spotName,
		announcementHtml,
	});
});
app.get("/1984", (_, res) => res.redirect("/wind/8700"));

// Routes for the admin page (edits the announcement bar shown at the top of both pages above)
app.get("/admin", requireAdminAuth, (_, res) =>
	res.sendFile(path.join(__dirname, "/public/adminPage/admin.html")),
);
app.get("/api/admin/announcement", requireAdminAuth, (req, res) =>
	getAnnouncementForAdmin(req, res),
);
app.post("/api/admin/announcement", requireAdminAuth, (req, res) => saveAnnouncement(req, res));

// Routes for data API's
app.get("/getData/:id", (req, res) => getData(req, res, req.query.date, locations));
app.get("/getOverviewData/:dataSource", (req, res) => getOverviewData(req, res, locations));
app.get("/giveLocationsParsingHarmonie", (_, res) =>
	getLocationListParsingHarmonie(res, locations),
);

// Route for feedback
app.post("/addFeedback", (req, res) => addFeedback(req, res));

// Route for unknown URLs
app.use("/", (_, res) => res.redirect("/"));
