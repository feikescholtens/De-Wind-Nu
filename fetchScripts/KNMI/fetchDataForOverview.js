import { subHours } from "date-fns";
import fetch from "node-fetch";
import { catchFetchError, JSON_ParseError } from "../errorHandlingFunctions.js";
import { getMatchedIDs } from "../fetchUtilFunctions.js";
import { KNMI_API_error } from "./helperFunctions.js";

export async function fetchDataForOverview_KNMI(locations, resolve) {
	let data = {}, // data is the object that will be returned
		rawData; // rawData is the raw data fetched from the API

	const beginDate = subHours(new Date(), 1).toISOString(); // Look for measurements from the last hour

	const rawDataString = await fetch(
		`https://api.dataplatform.knmi.nl/edr/v1/collections/10-minute-in-situ-meteorological-observations/cube?bbox=-180,-90,180,90&datetime=${beginDate}/..&parameter-name=ff,gff,dd`,
		{ headers: { Authorization: process.env.KDP_EDR_KEY } },
	)
		.then((response) => response.text())
		.catch((error) => catchFetchError(resolve, {}, error, "KNMI")); // This handles all errors that can occur during the fetch, like timeouts or no internet connection
	try {
		rawData = JSON.parse(rawDataString);
	} catch {
		JSON_ParseError(rawDataString, resolve, "KNMI");
		return;
	} // If the data can't be parsed to JSON, log, resolve and return
	if (KNMI_API_error(rawData, resolve)) return; // KNMI API returns an error in the JSON when there is no data or there is another error (beside fetch errors like timeouts)

	const IDMatches = getMatchedIDs(locations, "KNMI"); // Array with objects that contain the application ID and the KNMI ID

	rawData.coverages.forEach((locationData) => {
		// For each location with latest measurements

		const KNMI_ID = locationData["eumetnet:locationId"]; // Like 0-20000-0-06316
		const applicationID = IDMatches[KNMI_ID]; // Get application ID for the KNMI location
		if (applicationID === undefined) return;

		const timeStampString = locationData.domain.axes.t.values.at(-1);
		const indexLastMeasurement = locationData.domain.axes.t.values.indexOf(timeStampString);

		const windSpeed = locationData.ranges.ff?.values[indexLastMeasurement] * 1.94384449, // Convert m/s to knots
			windGusts = locationData.ranges.gff?.values[indexLastMeasurement] * 1.94384449, // Convert m/s to knots
			windDirection = locationData.ranges.dd?.values[indexLastMeasurement];

		data[applicationID] = {
			windSpeed: windSpeed,
			windGusts: windGusts,
			windDirection: windDirection,
			timeStamp: timeStampString,
		};
	});

	resolve(data);
}
