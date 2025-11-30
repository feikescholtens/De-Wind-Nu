// Helper functions for mapOrListInit.js, and mapOrListInit.js only
// Moved here to make the main file less cluttered

export function getMapBoxStyle(tilesObjects) {
	if (localStorage.getItem("tiles") === "auto") {
		if (localStorage.getItem("theme") === "auto") {
			if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
				return "mapbox://styles/mapbox/dark-v10";
			} else return tilesObjects.OpenStreetMap;
		} else if (localStorage.getItem("theme") === "dark") return "mapbox://styles/mapbox/dark-v10";
		else if (localStorage.getItem("theme") === "light") return tilesObjects.OpenStreetMap;
	}
	if (localStorage.getItem("tiles") === "OpenStreetMap") return tilesObjects.OpenStreetMap;
	if (localStorage.getItem("tiles") === "Mapbox custom")
		return "mapbox://styles/feikescholtens/ckuhc8nha9jft18s0muhoy0zf";
	if (localStorage.getItem("tiles") === "Mapbox licht") return "mapbox://styles/mapbox/light-v10";
	if (localStorage.getItem("tiles") === "Mapbox donker") return "mapbox://styles/mapbox/dark-v10";
	if (localStorage.getItem("tiles") === "Satelliet") return "mapbox://styles/mapbox/satellite-v9";
	if (localStorage.getItem("tiles") === "Satelliet met plaatsnamen en wegen")
		return "mapbox://styles/mapbox/satellite-streets-v11";
}

export function createPopupIDAndMarkerElement(location, locationID) {
	let popupId,
		marker = document.createElement("div");
	marker.className = "markerContainer";
	marker.innerHTML = `<div class="marker" title="${location.name}"></div>`;

	const dataset = location.measurements.source;
	if (["VLINDER", "RWS", "KNMI", "MVB"].includes(dataset)) {
		marker.classList.add(`markerContainer${dataset}`);
		Array.from(marker.getElementsByTagName("div")).forEach((element) => {
			element.classList.add(dataset);
		});
		popupId = `popup${dataset}`;
	} else {
		Array.from(marker.getElementsByTagName("div")).forEach((element) => {
			element.classList.add("Other");
		});
		popupId = `popupOther`;
	}

	Array.from(marker.getElementsByTagName("div")).forEach((element) => {
		element.id = locationID;
	});

	return [popupId, marker];
}

export const tilesObjects = {
	OpenStreetMap: {
		version: 8,
		sources: {
			openstreetmap: {
				type: "raster",
				tileSize: 512 / 2,
				tiles: [
					"https://retina-tiles.p.rapidapi.com/local/osm@2x/v1/{z}/{x}/{y}.png?rapidapi-key=aad550bd32msh735b5ac070fdf09p13faeejsn889accf115b2",
				],
				attribution:
					"Map tiles © <a target='_blank' href='https://www.maptilesapi.com/retina-tiles/'>Retina Tiles API</a> | Map data © <a target='_blank' href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors.",
				tilesFallback: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], //Automatically being set as a fallback
				attributionFallback:
					"&copy; <a target='_blank' href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors", //Automatically being set as a fallback
			},
		},
		layers: [
			{
				id: "openstreetmap",
				type: "raster",
				source: "openstreetmap",
			},
		],
	},
	OpenSeaMap: {
		id: "openseamap",
		type: "raster",
		source: {
			type: "raster",
			tiles: ["https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"],
			tileSize: 256,
		},
		layers: [
			{
				id: "openseamap",
				type: "raster",
				source: "openseamap",
			},
		],
		minzoom: 0,
		maxzoom: 22,
		paint: {
			"raster-opacity": 0.8,
		},
	},
};

export function determineCenterToZoomTo(whatToDetermine, removeEdgeOperaLocation) {
	let x, y, z;

	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get("x")) {
		//Highest priority, occurs when changing tiles
		x = parseFloat(urlParams.get("x"));
		y = parseFloat(urlParams.get("y"));
		z = parseFloat(urlParams.get("z"));
	} else if (
		localStorage.getItem("edgeOperaMapLocation") &&
		(window.navigator.userAgent.indexOf("Edg") > -1 || !!navigator.userAgent.match(/Opera|OPR\//))
	) {
		//Medium priority, occurs when
		//a user is referred from a wind-page. This is only triggered when using the Edge or Opera browser, since
		//window.history(-1) (in the wind page) in Edge and Opera actually RELOADS the homepage, so the map pans and zooms the normal way instead of
		//"remembering" the previously panned to location. Chrome, Safari, Firefox actually load the page from memory, so these values
		//will never be read from localStorage.
		//To prevent from reading this everytime the page loads (localStorage is persistant of course), delete the location from localStorage after
		//this function has ran for the second time (first time to return center, second time to return zoom level).
		const location = JSON.parse(localStorage.getItem("edgeOperaMapLocation"));
		x = location.x;
		y = location.y;
		z = location.z;

		globalThis.blockPanningOnReload = true;
		if (removeEdgeOperaLocation) localStorage.removeItem("edgeOperaMapLocation");
	} else {
		//Lowest priority. When there's nothing known about the previously panned to location.
		x = 5.160544;
		y = 52.182725;
		z = 6;
	}

	if (whatToDetermine === "center") return [x, y];
	if (whatToDetermine === "zoom") return z;
}

export function getLocationsForecastOnly() {
	const locationsForecastOnly = {};
	for (const id in data) {
		if (Object.keys(data[id].measurements).length === 0)
			locationsForecastOnly[id] = "FORECAST_ONLY";
	}
	return locationsForecastOnly;
}
