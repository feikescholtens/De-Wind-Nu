import { aquireAPI_key } from "./helperFunctions.js";

export async function giveMVBOverviewFetchOptions(locations, resolve) {
	const API_key = await aquireAPI_key(resolve);

	return {
		headers: {
			authorization: `Bearer ${API_key}`,
			"content-type": "application/json; charset=UTF-8",
		},
		body: `{
          "IDs": ${JSON.stringify(getLocationList(locations))}
        }`,
		method: "POST",
	};
}

function getLocationList(locations) {
	// This function returns an array of all the API_IDs of the locations that are from MVB

	const locationsArray = [];

	for (const id in locations) {
		if (locations[id].measurements.source !== "MVB") continue;
		for (let i = 0; i < locations[id].measurements.API_ID.length; i++)
			locationsArray.push(locations[id].measurements.API_ID[i]);
	}

	return locationsArray;
}
