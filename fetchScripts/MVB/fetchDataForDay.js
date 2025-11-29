import fetch from "node-fetch";
import { catchFetchError } from "../errorHandlingFunctions.js";
import { ISO_StringToLocalHHmm, theoreticalMeasurements } from "../fetchUtilFunctions.js";
import { MVB_API_error } from "./helperFunctions.js";
import { giveMVBFetchOptions } from "./helperFunctionsForDay.js";

export async function fetchDataForDay_MVB(dateParsed, databaseData, resolve, times, DSTDates) {
	let data = {}, // data is the object that will be returned
		rawData; // rawData is the raw data fetched from the API

	const rawDataString = await fetch(
		"https://api.meetnetvlaamsebanken.be/V2/getData",
		await giveMVBFetchOptions(dateParsed, DSTDates, databaseData, resolve),
	)
		.then((response) => response.text())
		.catch((error) => catchFetchError(resolve, data, error, "MVB")); // This handles all errors that can occur during the fetch, like timeouts or no internet connection
	try {
		rawData = JSON.parse(rawDataString);
	} catch {
		JSON_ParseError(rawDataString, resolve, "MVB");
		return;
	} // If the data can't be parsed to JSON, log, resolve and return
	if (MVB_API_error(rawData, resolve)) return;

	// Define variables
	let windSpeed = [],
		windGusts = [],
		windDirection = [];

	rawData.Values.forEach((parameter) => {
		// Loop through all the parameters in the data, like wind speed, gusts and direction
		if (parameter.Values.length === 0) return; // If there are no measurements for this parameter, return

		const measurementTimes = [], // MeasurementTimes is just an array with all the times of the measurements for this parameter
			tempArray = []; // This contains the actual measurements for the parameter that's being looped through

		parameter.Values.forEach((measurement) => {
			measurementTimes.push(ISO_StringToLocalHHmm(measurement.Timestamp, measurementTimes));
		}); // Add all the times of the measurements to the measurementTimes array

		times.forEach((timeStamp) => {
			// Loop through all the times that are requested [00:00, 00:10, ..., 00:00_nextDay]
			if (measurementTimes.includes(timeStamp) === false) {
				tempArray.push(-999);
				return;
			} // If the time is not in the measurementTimes array, add -999 to the tempArray to indicate that there is no data for this time (probably this time is in the future)

			let indexTime = measurementTimes.indexOf(timeStamp);
			if (tempArray[indexTime]) indexTime = measurementTimes.lastIndexOf(timeStamp); // Check if a time already exists in the temporary array.
			// This only happens when the clock turns one hour back when timezones switch from CEST to CET. 02:00, 02:10, 02:20, 02:30, 02:40, 02:50 will
			// already be in the temporary array, so look at the second value of these times in the measurementTimes array to get the right indici.

			const value = parameter.Values[indexTime]?.Value;
			if (value === undefined) {
				tempArray.push(-999);
				return;
			}
			tempArray.push(value);
		});

		const theoreticalMeasurementCount = theoreticalMeasurements(measurementTimes, times); // The amount of measurements that should be there, based on the length of the measurementTimes array
		for (let j = 0; j < times.length - theoreticalMeasurementCount; j++) tempArray.pop(); // Strip the tempArray of all the -999 values at the end

		// Set the wind_speed, wind_gusts and wind_direction arrays based on the parameter that's being looped through
		if (parameter.ID.includes("WVC"))
			windSpeed = structuredClone(tempArray).map((x) => x * 1.94384449); // Convert m/s to knots
		if (parameter.ID.includes("WC3"))
			windGusts = structuredClone(tempArray).map((x) => x * 1.94384449); // Convert m/s to knots
		if (parameter.ID.includes("WRS")) windDirection = structuredClone(tempArray);
	});

	data.MVB = [windSpeed, windGusts, windDirection];
	resolve({ data });
}
