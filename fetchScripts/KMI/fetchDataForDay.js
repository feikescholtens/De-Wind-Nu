import fetch from "node-fetch";
import { catchFetchError, JSON_ParseError } from "../errorHandlingFunctions.js";
import {
	ISO_StringToLocalHHmm,
	processAllNegativeArrays,
	theoreticalMeasurements,
} from "../fetchUtilFunctions.js";
import { composeUrl } from "./helperFunctions.js";

export async function fetchDataForDay_KMI(dateParsed, databaseData, resolve, times, DSTDates) {
	let data = {}, // data is the object that will be returned
		rawData; // rawData is the raw data fetched from the API

	const KMI_ID = databaseData.measurements.API_ID;
	const rawDataString = await fetch(composeUrl("day", KMI_ID, dateParsed, DSTDates))
		.then((response) => response.text())
		.catch((error) => catchFetchError(resolve, data, error, "KMI")); // This handles all errors that can occur during the fetch, like timeouts or no internet connection
	try {
		rawData = JSON.parse(rawDataString);
	} catch {
		JSON_ParseError(rawDataString, resolve, "KMI");
		return;
	} // If the data can't be parsed to JSON, log, resolve and return

	// Define variables
	const windSpeed = [],
		windGust = [],
		windDirection = [];
	const measurementTimes = [];
	rawData.features.forEach((measurementTime) => {
		measurementTimes.push(
			ISO_StringToLocalHHmm(measurementTime.properties.timestamp, measurementTimes),
		);
	}); // Add all the times of the measurements to the measurementTimes array

	times.forEach((timeStamp) => {
		// Loop through all the times that are requested [00:00, 00:10, ..., 00:00_nextDay]
		if (measurementTimes.includes(timeStamp) === false) {
			// If the time is not in the measurementTimes array, add -999 to all the data arrays to indicate that there is no data for this time (probably this time is in the future)
			[windSpeed, windGust, windDirection].forEach((array) => {
				array.push(-999);
			});
			return;
		}

		let indexTime = measurementTimes.indexOf(timeStamp);
		if (windSpeed[indexTime]) indexTime = measurementTimes.lastIndexOf(timeStamp); //Check if a time already exists in the data array.
		// This only happens when the clock turns one hour back when timezones switch from CEST to CET. 02:00, 02:10, 02:20, 02:30, 02:40, 02:50 will
		// already be in the data array, so look at the second value of these times in the measurementTimes array to get the right indici.

		// biome-ignore lint/suspicious/noDoubleEquals: Needed to check for both null and undefined
		if (rawData?.features[indexTime]?.properties?.wind_speed_10m != undefined)
			windSpeed.push(rawData.features[indexTime].properties.wind_speed_10m * 1.94384449); // Convert m/s to knots
		else windSpeed.push(-999);

		// biome-ignore lint/suspicious/noDoubleEquals: Needed to check for both null and undefined
		if (rawData?.features[indexTime]?.properties?.wind_gusts_speed != undefined)
			windGust.push(rawData.features[indexTime].properties.wind_gusts_speed * 1.94384449); // Convert m/s to knots
		else windGust.push(-999);

		// biome-ignore lint/suspicious/noDoubleEquals: Needed to check for both null and undefined
		if (rawData?.features[indexTime]?.properties?.wind_direction != undefined)
			windDirection.push(rawData.features[indexTime].properties.wind_direction);
		else windDirection.push(-999);
	});

	const theoreticalMeasurementCount = theoreticalMeasurements(measurementTimes, times);
	for (let j = 0; j < times.length - theoreticalMeasurementCount; j++)
		[windSpeed, windGust, windDirection].forEach((array) => {
			array.pop();
		}); // Strip the data arrays of all the -999 values at the end

	data.KMI = processAllNegativeArrays(windSpeed, windGust, windDirection);
	resolve({ data });
}
