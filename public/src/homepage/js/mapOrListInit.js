import { hideLoader, setNewNumber, showLoader } from "../../globalFunctions.js";
import {
	addCurrentLocationMarker,
	fetchDataAllSources,
	fitMapToMarkers,
} from "./independentFunctions.js";
import {
	createPopupIDAndMarkerElement,
	determineCenterToZoomTo,
	getLocationsForecastOnly,
	getMapBoxStyle,
	tilesObjects,
} from "./mapOrListInit_helpers.js";
import {
	checkOldMeasurement,
	panMapToLocation,
	setOverviewListData,
	setOverviewMapData,
} from "./sharedFunctions.js";

export async function initMap(dataAlreadyFetched, locationToUse) {
	document.querySelector("#settingsButton").addEventListener("click", () => {
		const scrollDiv = document.querySelector(".sectionHeader").offsetTop;
		window.scrollTo({ top: scrollDiv, behavior: "smooth" });
	});

	const center = determineCenterToZoomTo("center");
	const zoom = determineCenterToZoomTo("zoom", true);
	const excludeZoomFitMarkers = [
		"3318",
		"4806",
		"0727",
		"1843",
		"9057",
		"8609",
		"6823",
		"2214",
		"4371",
		"6660",
		"6019",
	];
	mapboxgl.accessToken =
		"pk.eyJ1IjoiZmVpa2VzY2hvbHRlbnMiLCJhIjoiY2t1aDlpZWEwMGhkYTJwbm02Zmt0Y21sOCJ9.PA3iy-3LQhjCkfxhxL2zUw";

	const mapOptions = {
		container: "map",
		center: center,
		zoom: zoom,
		style: getMapBoxStyle(tilesObjects),
	};

	globalThis.map = new mapboxgl.Map(mapOptions);
	map.touchZoomRotate.disableRotation();
	map.on("load", () => {
		if (localStorage.getItem("seaMap") === "1") map.addLayer(tilesObjects.OpenSeaMap);
	});
	map.once("render", () => {
		document.querySelector("#settingsButton").classList.remove("noDisplay");
	});
	map.on("error", async (error) => {
		if (error.error.status === 429) {
			map.getSource("openstreetmap").tiles =
				tilesObjects.OpenStreetMap.sources.openstreetmap.tilesFallback;
			map.getSource("openstreetmap").attribution =
				tilesObjects.OpenStreetMap.sources.openstreetmap.attributionFallback;

			map.triggerRepaint();
			map._controls[0]._updateAttributions();

			console.log(
				"Request error 429 from above can be neglegted. They are due to (rate) limits of the high resolution tiles API, which are expected (if user has large screen or daily limits are reached). Switched tile URL to one with unlimited requests.",
			);
		}
	});
	setOverviewMapData({ FORECAST_ONLY: getLocationsForecastOnly() }, map); //Call the function to update the popups that only have forecast data in the map
	if (!dataAlreadyFetched) fetchDataAllSources(setOverviewMapData, map);
	else setOverviewMapData(globalThis.measurementsBySource, map);

	const locationIDsSortedByDistance = Object.keys(locations).sort(
		(a, b) => locations[a].distance - locations[b].distance,
	);
	const closestLocationID = locationIDsSortedByDistance[0];

	for (const id in locations) {
		if (!excludeZoomFitMarkers.includes(id)) {
			markersLats.push(locations[id].lat);
			markersLons.push(locations[id].lon);
		}

		const [popupId, marker] = createPopupIDAndMarkerElement(locations[id], id);

		const popup = document.querySelector("[data-templateMapPopup]").cloneNode(true).content;
		popup.querySelector("div").id = id;
		const button = popup.querySelector("button");
		button.className = `colouredButton ${popupId}`;
		button.innerText = locations[id].name;
		button.addEventListener("click", () => {
			localStorage.setItem(
				"edgeOperaMapLocation",
				JSON.stringify({ x: map.getCenter().lng, y: map.getCenter().lat, z: map.getZoom() }),
			);
			window.location.assign(`${window.location.protocol}//${window.location.host}/wind/${id}`);
		});

		globalThis.popUps[id] = { Node: popup.querySelector("div") };

		const popUpObject = new mapboxgl.Popup({ offset: 13, closeButton: false }).setDOMContent(popup);
		const markerObject = new mapboxgl.Marker(marker).setLngLat([
			locations[id].lon,
			locations[id].lat,
		]);
		markerObject.setPopup(popUpObject).addTo(map);
		globalThis.popUps[id].Object = popUpObject;

		if (id === closestLocationID) {
			globalThis.closestMarkerToCurrentLocationObject = markerObject;
		}
	}

	[markersLats, markersLons].forEach((array) => {
		array.sort();
	});

	if (center[0] === 5.160544 && center[1] === 52.182725) {
		if (locationToUse) panMapToLocation(locationToUse, true);
		else fitMapToMarkers(map, markersLats, markersLons);
	} else {
		history.replaceState({}, "De Wind Nu", "/");
		addCurrentLocationMarker(true, locationToUse.lat, locationToUse.lon);
	}

	//Show popup with instruction / suggestion to click on windsock to view more measurements on closest location
	if (localStorage.getItem("popupClickOnLocationSuggestionShowed") === "1") return; //This suggestion has already been shown once

	const popupElement = document.createElement("div");
	popupElement.id = "popupSuggestionClickMarker";
	popupElement.classList = "popUp alwaysBlackText";
	popupElement.innerHTML =
		"Druk op een windzak voor de recentste meting. <br><br> Vervolgens kun je met de gekleurde knop alle metingen bekijken!";
	const popUpObject = new mapboxgl.Popup({ offset: 13, closeButton: false }).setDOMContent(
		popupElement,
	);
	closestMarkerToCurrentLocationObject.setPopup(popUpObject);
	if (localStorage.getItem("userChoseLocationPreference") === "1")
		closestMarkerToCurrentLocationObject.togglePopup();

	const popUpObjectOriginal = globalThis.popUps[closestLocationID].Object;

	closestMarkerToCurrentLocationObject._element.addEventListener("click", () =>
		closestMarkerToCurrentLocationObject.setPopup(popUpObjectOriginal),
	);
	popUpObject.once("close", () => {
		if (!document.querySelector("[data-locationpopuptitle]"))
			localStorage.setItem("popupClickOnLocationSuggestionShowed", "1");

		closestMarkerToCurrentLocationObject.setPopup(popUpObjectOriginal);
	});

	/////////
}

export function initList(dataAlreadyFetched, locationToUse) {
	const listSort = localStorage.getItem("listSort");
	const sortsByWind = listSort === "windSpeed" || listSort === "windGusts";

	//Wind speed/gusts aren't available yet at this point (they're fetched per source below), so the list
	//needs to wait for that data to arrive before it can be built and sorted
	if (sortsByWind && !dataAlreadyFetched) {
		showLoader();
		const loaderNumberInterval = setInterval(() => setNewNumber(), 80);

		fetchDataAllSources((measurementsBySource) => {
			Object.keys(measurementsBySource).forEach((dataSource) => {
				globalThis.measurementsBySource[dataSource] = { ...measurementsBySource[dataSource] };
			});
		}).then(() => {
			clearInterval(loaderNumberInterval);
			hideLoader();

			buildList(sortLocationsByWind(listSort), locationToUse);
			setOverviewListData(globalThis.measurementsBySource);
		});
		return;
	}

	//Distance can only be sorted on if a location was retrieved; without one, fall back to alphabetical
	//(the "Afstand" option is also greyed out in that case, see wireListSortSelector)
	const sortedLocations = sortsByWind
		? sortLocationsByWind(listSort)
		: listSort === "distance" && locationToUse
			? Object.entries(locations).sort((a, b) => a[1].distance - b[1].distance)
			: Object.entries(locations).sort((a, b) => a[1].name.localeCompare(b[1].name));

	buildList(sortedLocations, locationToUse);

	if (!dataAlreadyFetched) fetchDataAllSources(setOverviewListData);
	else setOverviewListData(globalThis.measurementsBySource);
}

function buildList(sortedLocations, locationToUse) {
	for (let i = 0; i < sortedLocations.length; i++) {
		const [popupId, marker] = createPopupIDAndMarkerElement(
			sortedLocations[i][1],
			sortedLocations[i][0],
		);

		const listItem = document.querySelector("[data-templateListItem]").cloneNode(true).content;
		const button = listItem.querySelector("button");
		button.className = `colouredButton ${marker.querySelector("div").classList[1]} ${popupId}`;
		button.innerText = sortedLocations[i][1].name;
		button.addEventListener("click", () =>
			window.location.assign(
				`${window.location.protocol}//${window.location.host}/wind/${sortedLocations[i][0]}`,
			),
		);

		if (locationToUse)
			listItem.querySelector(".distance").innerText = `${sortedLocations[i][1].distance} km`;

		listItem.querySelector("div").id = sortedLocations[i][0];
		document.getElementById("list").append(listItem);
	}
}

// Sorts locations by highest windSpeed/windGusts first; locations without a recent measurement for that
// field are sorted last (values are always >= 0, so -1 works as an always-lowest sentinel)
function sortLocationsByWind(field) {
	return Object.entries(locations).sort(
		(a, b) => getWindValueForSort(b[0], field) - getWindValueForSort(a[0], field),
	);
}

function getWindValueForSort(locationID, field) {
	const source = locations[locationID]?.measurements?.source;
	const locationData = source ? globalThis.measurementsBySource[source]?.[locationID] : undefined;
	if (!locationData || checkOldMeasurement(locationData)) return -1;

	const value = locationData[field];
	return typeof value === "number" ? value : -1;
}
