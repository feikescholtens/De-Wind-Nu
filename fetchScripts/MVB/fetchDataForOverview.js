import { parseISO } from "date-fns";
import fetch from "node-fetch";
import { catchFetchError, JSON_ParseError } from "../errorHandlingFunctions.js";
import { getMatchedIDs } from "../fetchUtilFunctions.js";
import { MVB_API_error } from "./helperFunctions.js";
import { giveMVBOverviewFetchOptions } from "./helperFunctionsForOverview.js";

export async function fetchDataForOverview_MVB(locations, resolve) {
	let data = {}, // data is the object that will be returned
		rawData; // rawData is the raw data fetched from the API

	const rawDataString = await fetch(
		"https://api.meetnetvlaamsebanken.be/V2/CurrentData",
		await giveMVBOverviewFetchOptions(locations, resolve),
	)
		.then((response) => response.text())
		.catch((error) => catchFetchError(resolve, {}, error, "MVB", true)); // This handles all errors that can occur during the fetch, like timeouts or no internet connection
	try {
		rawData = JSON.parse(rawDataString);
	} catch {
		JSON_ParseError(rawDataString, resolve, "MVB", true);
		return;
	} // If the data can't be parsed to JSON, log, resolve and return
	if (MVB_API_error(rawData, resolve, true)) return;

	const IDMatches = getMatchedIDs(locations, "MVB"); // Array with objects that contain the application ID and the RWS ID

	rawData.forEach((locationData) => {
		// For each location with latest measurements

		const applicationID = IDMatches[locationData.ID]; // Get application ID for the MVB location
		// biome-ignore lint/suspicious/noDoubleEquals: Needed to check for both null and undefined
		if (data[applicationID] == undefined) data[applicationID] = {}; // Create object for the application ID if it doesn't exist

		const parameterName = locationData.ID; // Like "MP7WRS" or "OMPWC3"
		const measurementValue = locationData.Value; // Numeric value of the measurement

		if (parameterName.includes("WVC"))
			data[applicationID].windSpeed = measurementValue * 1.94384449; // Convert m/s to knots
		if (parameterName.includes("WC3"))
			data[applicationID].windGusts = measurementValue * 1.94384449; // Convert m/s to knots
		if (parameterName.includes("WRS")) data[applicationID].windDirection = measurementValue;

		if (parameterName.includes("WVC"))
			data[applicationID].timeStamp = parseISO(locationData.Timestamp).toISOString();
	});

	resolve(data);
}
