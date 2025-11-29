import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export function ISO_StringToLocalHHmm(ISO_String, measurementTimes) {
	const dateOBJ_UTC = parseISO(ISO_String);
	let timeFormatted = formatInTimeZone(dateOBJ_UTC, global.userTimeZone, "HH:mm");

	if (timeFormatted === "00:00" && measurementTimes.length > 0) timeFormatted = "00:00_nextDay";
	return timeFormatted;
}

export function processAllNegativeArrays(wind_speed, wind_gusts, wind_direction) {
	if (!wind_speed.some((value) => value > 0)) wind_speed = [];
	if (!wind_gusts.some((value) => value > 0)) wind_gusts = [];
	if (!wind_direction.some((value) => value > 0)) wind_direction = [];

	return [wind_speed, wind_gusts, wind_direction];
}

export function getMatchedIDs(locations, measurementSource) {
	// This function returns an object with the API IDs as keys and the application IDs as values, for the given measurement source

	const IDMatches = {};

	for (const id in locations) {
		if (locations[id].measurements.source !== measurementSource) continue;

		if (typeof locations[id].measurements.API_ID === "object") {
			// For the MVB API, the API_ID is an array of IDs
			for (let i = 0; i < locations[id].measurements.API_ID.length; i++)
				IDMatches[locations[id].measurements.API_ID[i]] = id;
		} else IDMatches[locations[id].measurements.API_ID] = id; // For the other APIs, the API_ID is a string
	}

	return IDMatches;
}

export function theoreticalMeasurements(measurementTimes, times) {
	if (measurementTimes.length === 0) return 0;

	const lastMeasurementTime = measurementTimes[measurementTimes.length - 1];
	const theoreticalMeasurementCount = times.indexOf(lastMeasurementTime);

	return theoreticalMeasurementCount + 1;
}
