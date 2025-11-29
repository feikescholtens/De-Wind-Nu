import { getUnixTime, parse } from "date-fns";
import { log } from "../../serverFunctions.js";
import { resolveEmptyArrays } from "../errorHandlingFunctions.js";

export async function aquireAPI_key(resolve) {
	// The MVB API requires an API key to be requested, which is only valid for 1 hour (I believe so, might be wrong)
	// The key is aquired by passing a username and password to the API

	if (
		Object.keys(global.MVBAPIKey).length !== 0 &&
		getUnixTime(new Date()) + 5 < global.MVBAPIKey.expirationDate
	)
		return global.MVBAPIKey.APIKey; // If the API key is still valid, return the API key

	// There is no API key stored in the global variable or it has been expired, so we need to aquire one
	let rawData; // rawData is the raw data fetched from the API

	const rawDataString = await fetch("https://api.meetnetvlaamsebanken.be/Token", {
		headers: {
			"content-type": "application/x-www-form-urlencoded charset=UTF-8",
		},
		body: `grant_type=password&username=dewindnu@gmail.com&password=${process.env.MVB_PWD_ENCODED}`,
		method: "POST",
	})
		.then((response) => response.text())
		.catch((error) => catchFetchError(resolve, data, error, "MVB")); // This handles all errors that can occur during the fetch, like timeouts or no internet connection
	try {
		rawData = JSON.parse(rawDataString);
	} catch {
		JSON_ParseError(rawDataString, resolve, "MVB");
		return;
	} // If the data can't be parsed to JSON, log, resolve and return
	if (MVB_API_error(rawData, resolve)) return;

	const epochExpireDateTime = MVB_datesToEpoch(rawData[".expires"]);
	const epochIssuedDateTime = MVB_datesToEpoch(rawData[".issued"]);

	global.MVBAPIKey = {
		expirationDate: epochExpireDateTime,
		issuedDate: epochIssuedDateTime,
		APIKey: rawData.access_token,
	};

	return global.MVBAPIKey.APIKey;
}

function MVB_datesToEpoch(dateString) {
	const dateStringToParse = dateString.replace("GMT", "+00"); // Nessesary for parsing
	const parsedDate = parse(dateStringToParse, "EEE, dd MMM yyyy HH:mm:ss x", new Date());
	const epochTime = getUnixTime(parsedDate);

	return epochTime;
}

export function MVB_API_error(rawData, resolve) {
	if (rawData.Message) {
		log(`Meetnet Vlaamse Banken API "Message"-error: ${rawData.Message}`, "error", true);

		resolveEmptyArrays(resolve, "MVB");

		return true;
	}

	return false;
}
