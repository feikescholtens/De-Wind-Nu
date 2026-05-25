export function giveRWSOverviewFetchOptions(locations) {
	const fetchBody = {
		AquoPlusWaarnemingMetadataLijst: [
			{
				AquoMetadata: {
					Grootheid: {
						Code: "WINDSHD",
					},
				},
			},
			{
				AquoMetadata: {
					Grootheid: {
						Code: "WINDSTOOT",
					},
				},
			},
			{
				AquoMetadata: {
					Grootheid: {
						Code: "WINDRTG",
					},
				},
			},
		],
		LocatieLijst: getLocationList(locations),
	};

	return {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(fetchBody),
		method: "POST",
	};
}

function getLocationList(locations) {
	const locationsArray = [];

	for (const id in locations) {
		if (locations[id].measurements.source !== "RWS") continue;

		locationsArray.push({
			Code: locations[id].measurements.API_ID,
		});
	}

	return locationsArray;
}
