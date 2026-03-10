// Functions that are used in multiple files in homepage folder
// For example in index.js and mapOrListInit.js

import { differenceInMinutes, differenceInSeconds, isValid, parseISO } from "date-fns";
import { directionToLetters } from "../../globalIndependentFunctions.js";
import {
	addCurrentLocationMarker,
	convertValueToBft,
	fitMapToMarkers,
} from "./independentFunctions.js";

export function panMapToLocation(locationToUse, addMarker) {
	//Fit map (if a location is not set in the URL as parameters), based on location (if not available fit to all markers)
	if (!locationToUse || locationToUse === "failed") return;

	addCurrentLocationMarker(addMarker, locationToUse.lat, locationToUse.lon);

	const bound = 0.2;
	let factors = [0.5, 0.5];
	//Normally the bound to which we extend the map around the current location is the same top to bottom
	//However when we prompt the user for location preference, we top bound needs to get bigger and the botto bound smaller
	//Code inside if-statement calculates the factors by which we need to adjust
	if (localStorage.getItem("userChoseLocationPreference") === "0") {
		const estimatedHeightLocationPopup =
			document.querySelector(".circleCurrentLocation").clientHeight * 20;
		const remainingPixelsToSpaceOut =
			document.querySelector("#mapWrapper").clientHeight - estimatedHeightLocationPopup;

		const pixelsMarkerToBottom = remainingPixelsToSpaceOut / 2;
		const pixelsMarkerToTop = remainingPixelsToSpaceOut / 2 + estimatedHeightLocationPopup;

		const factorBottom = pixelsMarkerToBottom / document.querySelector("#mapWrapper").clientHeight;
		const factorTop = pixelsMarkerToTop / document.querySelector("#mapWrapper").clientHeight;

		factors = [factorTop, factorBottom];
	}

	const latBounds = [
			locationToUse.lat + 2 * bound * factors[0],
			locationToUse.lat - 2 * bound * factors[1],
		],
		lonBounds = [locationToUse.lon + bound, locationToUse.lon - bound];
	fitMapToMarkers(map, latBounds, lonBounds);
}

export function setOverviewMapData(data, map) {
	Object.keys(data).forEach((dataSource) => {
		globalThis.data[dataSource] = { ...data[dataSource] };

		if (!map._loaded)
			map.on("load", () => {
				for (const locationID in data[dataSource]) {
					if (!checkOldMeasurement(data[dataSource][locationID])) {
						addWindSockArmAndBftToMap(data[dataSource][locationID], dataSource, locationID);
						updatePopUp(data[dataSource][locationID], locationID);
					}
				}
			});
		else {
			for (const locationID in data[dataSource]) {
				if (!checkOldMeasurement(data[dataSource][locationID])) {
					addWindSockArmAndBftToMap(data[dataSource][locationID], dataSource, locationID);
					updatePopUp(data[dataSource][locationID], locationID);
				}
			}
		}
	});
}

export function setOverviewListData(data) {
	Object.keys(data).forEach((dataSource) => {
		globalThis.data[dataSource] = { ...data[dataSource] };

		for (const locationID in data[dataSource]) {
			if (!checkOldMeasurement(data[dataSource][locationID])) {
				setMeasurementData(
					document.querySelector(`[id="${locationID}"]`),
					data[dataSource][locationID],
					false,
				);
			}
		}
	});
}

//Helper functions

function updatePopUp(dataLocation, locationID) {
	if (!popUps[locationID]) return;

	const container = popUps[locationID].Node;
	const popUpWithData = setMeasurementData(container, dataLocation, true);

	popUps[locationID].Object.setDOMContent(popUpWithData);
}

function addWindSockArmAndBftToMap(dataLocation, dataSource, locationID) {
	if (!dataLocation) return;

	// biome-ignore lint/suspicious/noDoubleEquals: Needed to check for both null and undefined
	if (dataLocation.windSpeed == undefined) return;
	const windSpeedBft = convertValueToBft(dataLocation.windSpeed);
	document.getElementById(locationID).innerText = windSpeedBft;

	// biome-ignore lint/suspicious/noDoubleEquals: Needed to check for both null and undefined
	if (dataLocation.windDirection == undefined) return;

	const windSockArm = document.createElement("div");
	windSockArm.classList.add("windSockArm");
	windSockArm.classList.add(dataSource);

	windSockArm.style.transform = `translateX(calc(-0.3 * var(--markerSize))) rotate(${dataLocation.windDirection}deg)`;
	document.getElementById(locationID).parentNode.prepend(windSockArm);
}

function checkOldMeasurement(dataLocation) {
	// Checks if the measurement is older than 24 hours, if so it is not shown on the map or list. This is done by checking the timeStamp of the measurement and comparing it to the current time.
	if (dataLocation === "FORECAST_ONLY") return;

	// Skip if dataLocation is not a valid measurement object
	if (!dataLocation || typeof dataLocation !== "object") return true;

	const timeStampString = dataLocation.timeStamp;
	if (!timeStampString) return;

	const timeStamp = parseISO(timeStampString);
	if (isValid(timeStamp)) {
		const relativeMinutes = differenceInMinutes(new Date(), timeStamp);
		if (relativeMinutes > 24 * 60) return true;
	}
}

function setMeasurementData(container, dataLocation, returnNode) {
	//if returnNode == true, the function returns the node elements to be set in the popup, for the list this is not
	//necessary as the node elements are already in the DOM

	let windSpeed,
		windGusts,
		windDirection,
		windDirectionLetters = "",
		directionArrow = "";

	const windSpeedGustsElement = container.querySelector(".windSpeedGusts"),
		windDirectionElement = container.querySelector(".windDirection"),
		relativeTimeElement = container.querySelector(".relativeTime");

	if (dataLocation === "FORECAST_ONLY") {
		windSpeedGustsElement?.remove();
		windDirectionElement?.remove();
		relativeTimeElement?.remove();

		if (returnNode) return container;
		else return;
	}

	windSpeed = dataLocation.windSpeed;
	// biome-ignore lint/suspicious/noDoubleEquals: Needed to check for both null and undefined
	if (windSpeed != undefined) {
		if (unit !== "Bft") windSpeed = (units[unit].factor * windSpeed).toFixed(decimals);
		else windSpeed = convertValueToBft(windSpeed);
	} else windSpeed = "-";
	windGusts = dataLocation.windGusts;
	// biome-ignore lint/suspicious/noDoubleEquals: Needed to check for both null and undefined
	if (windGusts != undefined) {
		if (unit !== "Bft") windGusts = (units[unit].factor * windGusts).toFixed(decimals);
		else windGusts = convertValueToBft(windGusts);
	} else windGusts = "-";
	windDirection = dataLocation.windDirection;
	// biome-ignore lint/suspicious/noDoubleEquals: Needed to check for both null and undefined
	if (windDirection != undefined) {
		windDirection = windDirection.toFixed(0);
		windDirectionLetters = directionToLetters(windDirection);
		directionArrow = `<div style="transform: rotate(${windDirection}deg);" title="Windrichting" class="listElementArrow">
    <svg xmlns="http://www.w3.org/2000/svg" height="25" viewBox="0 96 960 960" width="25"><path d="M480 974q-9 0-17.5-3T447 960L208 721q-15-14-15-33.5t15-33.5q13-14 32-14t33 14l160 160V198q0-20 13.5-33t33.5-13q20 0 33.5 13.5T527 199v615l160-160q13-13 32.5-13.5T753 654q14 14 14 33.5T753 721L513 960q-7 8-15.5 11t-17.5 3Z"/></svg>
    </div>`;
	} else windDirection = "-";

	windSpeedGustsElement.innerText = `${windSpeed.replace(".", ",")} / ${windGusts.replace(".", ",")} ${unit}`;
	windDirectionElement.innerHTML = `${windDirection}° / ${windDirectionLetters} ${directionArrow}`;

	const timeStampString = dataLocation.timeStamp;
	const timeStamp = parseISO(timeStampString);
	if (isValid(timeStamp)) {
		const relativeMinutes = differenceInMinutes(new Date(), timeStamp);

		if (relativeMinutes === 0) {
			const relativeSeconds = differenceInSeconds(new Date(), timeStamp);
			relativeTimeElement.innerText = `${relativeSeconds} seconden geleden`;
		} else if (relativeMinutes === 1) {
			relativeTimeElement.innerText = `${relativeMinutes} minuut geleden`;
		} else {
			relativeTimeElement.innerText = `${relativeMinutes} minuten geleden`;
		}
	}

	if (returnNode) return container;
}
