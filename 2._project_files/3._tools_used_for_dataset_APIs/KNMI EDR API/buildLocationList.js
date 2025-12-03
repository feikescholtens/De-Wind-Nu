//Motivation: this script takes all locations that currently give data (as long as No. measurements today	>> 0)
//in the KNMI EDR API. It also gives a yes or no in the 'Currently in use as KNMI location' column.

//Open the table.html file for the result

import fetch from "node-fetch";

const dotenv = await import("dotenv");
dotenv.config({ path: "../../../.env" });

import { readFileSync, writeFileSync } from "node:fs";
import { startOfDay } from "date-fns";

const apiKey = process.env.KDP_EDR_KEY;

const locations = Object.fromEntries(
	Object.entries(JSON.parse(readFileSync("../../../locations.json"))).filter(
		([_, value]) => value.active,
	),
);
const data = await fetch(
	"https://api.dataplatform.knmi.nl/edr/v1/collections/10-minute-in-situ-meteorological-observations/locations",
	{ headers: { Authorization: apiKey } },
).then((response) => response.json());

const dateTodayStart = startOfDay(new Date()).toISOString();

const table = [
	["ID", "Name", "No. measurements today", "Currently in use as KNMI location", "lat", "lon"],
];

for (let i = 0; i < data.features.length; i++) {
	const row = [];

	const lon = data.features[i].geometry.coordinates[0];
	const lat = data.features[i].geometry.coordinates[1];
	const locationID = data.features[i].id;
	const locationName = data.features[i].properties.name;

	console.log(`Fetching data for location ID ${locationID} - ${locationName}`);
	const dataLocation = await fetch(
		`https://api.dataplatform.knmi.nl/edr/v1/collections/10-minute-in-situ-meteorological-observations/locations/${locationID}?datetime=${dateTodayStart}/..&parameter-name=ff,gff,dd`,
		{ headers: { Authorization: apiKey } },
	).then((response) => response.json());

	row.push(locationID);
	row.push(locationName);
	if (dataLocation.detail) row.push(`0, KNMI API: ${dataLocation.detail}`);
	else row.push(dataLocation.coverages[0].domain.axes.t.values.length);

	// if (dataLocation.domain.axes.t.values.length === 0)
	const keyInLocationsIfExistant = Object.keys(locations).find((key) => {
		if (locations[key].measurements.API_ID === locationID) {
			return true;
		} else return false;
	});

	if (keyInLocationsIfExistant) row.push("yes");
	else row.push("no");

	row.push(lat);
	row.push(lon);

	table.push(row);
}

writeFileSync("table.html", JSON.stringify(makeTableHTML(table)));

function makeTableHTML(myArray) {
	let result = "<table border=1>";
	for (let i = 0; i < myArray.length; i++) {
		result += "<tr>";
		for (let j = 0; j < myArray[i].length; j++) {
			result += `<td>${myArray[i][j]}</td>`;
		}
		result += "</tr>";
	}
	result += "</table>";

	return result;
}
