import fetch from "node-fetch";
import { catchFetchError, JSON_ParseError } from "../errorHandlingFunctions.js";
import { processAllNegativeArrays, theoreticalMeasurements } from "../fetchUtilFunctions.js";
import { VLINDER_API_error, VLINDER_dateStringToLocalHHmm } from "./helperFunctions.js";
import { getFetchDates } from "./helperFunctionsForDay.js";

export async function fetchDataForDay_VLINDER(dateParsed, databaseData, resolve, times, DSTDates) {
	let data = {}, // data is the object that will be returned
		rawData; // rawData is the raw data fetched from the API

	const VLINDER_ID = databaseData.measurements.API_ID;
	const [dateStartFetch, dateEndFetch] = getFetchDates(dateParsed, DSTDates);

	const rawDataString = await fetch(
		`https://mooncake.ugent.be/api/measurements/${VLINDER_ID}?start=${dateStartFetch}&end=${dateEndFetch}`,
	)
		.then((response) => response.text())
		.catch((error) => catchFetchError(resolve, data, error, "VLINDER")); // This handles all errors that can occur during the fetch, like timeouts or no internet connection
	try {
		rawData = JSON.parse(rawDataString);
	} catch {
		JSON_ParseError(rawDataString, resolve, "VLINDER");
		return;
	} // If the data can't be parsed to JSON, log, resolve and return
	if (VLINDER_API_error(rawData, resolve)) return; // Check for error in the returned data

	// Define variables
	const windSpeed = [],
		windGust = [],
		windDirection = [];
	const measurementTimes = [];

	rawData.forEach((measurement) => {
		measurementTimes.push(VLINDER_dateStringToLocalHHmm(measurement.time, measurementTimes));
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
		if (windSpeed[indexTime]) indexTime = measurementTimes.lastIndexOf(timeStamp); // Check if a time already exists in the data array.
		// This only happens when the clock turns one hour back when timezones switch from CEST to CET. 02:00, 02:10, 02:20, 02:30, 02:40, 02:50 will
		// already be in the data array, so look at the second value of these times in the measurementTimes array to get the right indici.

		// biome-ignore lint/suspicious/noDoubleEquals: Need to check for undefined and null
		if (rawData[indexTime].windSpeed != undefined)
			windSpeed.push(rawData[indexTime].windSpeed * 0.53995726994149); // Convert km/h to knots
		else windSpeed.push(-999);

		// biome-ignore lint/suspicious/noDoubleEquals: Need to check for undefined and null
		if (rawData[indexTime].windGust != undefined)
			windGust.push(rawData[indexTime].windGust * 0.53995726994149); // Convert km/h to knots
		else windGust.push(-999);

		// biome-ignore lint/suspicious/noDoubleEquals: Need to check for undefined and null
		if (rawData[indexTime].windDirection != undefined)
			windDirection.push(rawData[indexTime].windDirection);
		else windDirection.push(-999);
	});

	const theoreticalMeasurementCount = theoreticalMeasurements(measurementTimes, times); // The amount of measurements that should be there, based on the length of the measurementTimes array
	for (let j = 0; j < times.length - theoreticalMeasurementCount; j++)
		[windSpeed, windGust, windDirection].forEach((array) => {
			array.pop();
		}); // Strip the data arrays of all the -999 values at the end

	data.VLINDER = processAllNegativeArrays(windSpeed, windGust, windDirection);
	resolve({ data });
}
