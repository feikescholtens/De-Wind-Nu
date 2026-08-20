import fetch from "node-fetch";
import { catchFetchError, JSON_ParseError } from "../errorHandlingFunctions.js";
import { getMatchedIDs } from "../fetchUtilFunctions.js";
import { composeUrl } from "./helperFunctions.js";

export async function fetchDataForOverview_KMI(locations, resolve) {
	let data = {}, // data is the object that will be returned
		rawData; // rawData is the raw data fetched from the API

	const rawDataString = await fetch(composeUrl("overview"))
		.then((response) => response.text())
		.catch((error) => catchFetchError(resolve, {}, error, "KMI", true)); // This handles all errors that can occur during the fetch, like timeouts or no internet connection
	try {
		rawData = JSON.parse(rawDataString);
	} catch {
		JSON_ParseError(rawDataString, resolve, "KMI", true);
		return;
	} // If the data can't be parsed to JSON, log, resolve and return
	const IDMatches = getMatchedIDs(locations, "KMI"); // Array with objects that contain the application ID and the KMI ID

	rawData.features.forEach((locationData) => {
		// Loops over all features, which are in most cases more than one measurement for each location
		// Not possible to request for only one measurement per location, so instead (for each location)
		// the measurements of the last hour are fetched and the latest measurement is automatically used
		// (because of the sortby=timestamp parameter)

		const KMI_ID = locationData.properties.code; // Like 6418

		const applicationID = IDMatches[KMI_ID]; // Get application ID for the KMI location
		if (applicationID === undefined) return;

		const timeStampString = locationData.properties.timestamp;

		const windSpeed = locationData.properties.wind_speed_10m * 1.94384449, // Convert m/s to knots
			windGusts = locationData.properties.wind_gusts_speed * 1.94384449, // Convert m/s to knots
			windDirection = locationData.properties.wind_direction;

		data[applicationID] = {
			windSpeed: windSpeed,
			windGusts: windGusts,
			windDirection: windDirection,
			timeStamp: timeStampString,
		};
	});

	resolve(data);
}
