// Helper functions for index.js and index.js only
// To avoid circular dependencies, functions that are only used in index.js are put in this file

import { initList, initMap } from "./mapOrListInit.js";
import { panMapToLocation } from "./sharedFunctions.js";

export function changeOverviewForm(selector, e) {
	let clickedOption;
	if (e)
		clickedOption = e.target.textContent.replace(/\s/g, ""); //When using tabs
	else clickedOption = selector.value; //When using selector in settings

	//Check if the overviewForm is changed at all
	if (["Kaart", "map"].includes(clickedOption) && localStorage.getItem("overviewForm") === "map")
		return;
	if (["Lijst", "list"].includes(clickedOption) && localStorage.getItem("overviewForm") === "list")
		return;

	if (["Kaart", "map"].includes(clickedOption)) {
		selector.value = "map";
		document.querySelector("[data-map]").classList.add("active");
		document.querySelector("[data-list]").classList.remove("active");
		document.querySelector(".tabIndicator").style.left = `calc(0 * 80px)`;
	}
	if (["Lijst", "list"].includes(clickedOption)) {
		selector.value = "list";
		document.querySelector("[data-map]").classList.remove("active");
		document.querySelector("[data-list]").classList.add("active");
		document.querySelector(".tabIndicator").style.left = `calc(1 * 80px + 5px)`;
	}

	localStorage.setItem("overviewForm", selector.value);

	const main = document.getElementsByTagName("main")[0];
	const mapNodeElements = [document.getElementById("mapWrapper")];
	const listNodeElements = [
		document.getElementById("list"),
		document.querySelector("#barLocationNotificationList"),
	];

	//Remove list elements and add map element
	if (localStorage.getItem("overviewForm") === "map") {
		listNodeElements.forEach((element) => {
			element.remove();
		});

		const divOuter = document.createElement("div");
		divOuter.id = "mapWrapper";
		divOuter.innerHTML = `<div data-barLocationNotification id="barLocationNotificationMap" class="barLocationNotification noDisplay"></div>
    <div id="map"></div>
    <button id="settingsButton" class="noDisplay" aria-label="settings">
        <div title="Scroll naar de instellingen" class="noSelect" id="iconSettings">
          <svg xmlns="http://www.w3.org/2000/svg" height="42" viewBox="0 96 960 960" width="42"><path d="M552 1001H408q-18 0-32-11t-16-29l-15-94q-13-4-29.5-13.5T288 835l-86 41q-17 8-34.5 2T141 855L68 725q-10-16-5.5-33.5T81 663l80-58q-1-6-1.5-14.5T159 576q0-6 .5-14.5T161 547l-80-59q-14-11-18.5-28.5T68 427l73-130q10-15 27.5-21.5T202 277l88 40q10-8 26-17t29-13l15-97q2-18 16-29t32-11h144q18 0 32 11t16 29l15 96q13 5 29.5 13.5T672 317l86-40q16-8 34-2t27 22l74 129q10 16 5.5 34T879 488l-81 57q1 7 2 15.5t1 15.5q0 7-1 15t-2 15l81 57q14 11 18.5 28.5T893 725l-75 130q-9 17-26 23t-34-2l-87-41q-11 9-26.5 18.5T615 867l-15 94q-2 18-16 29t-32 11Zm-74-295q54 0 92-38t38-92q0-54-38-92t-92-38q-54 0-92 38t-38 92q0 54 38 92t92 38Zm0-60q-30 0-50-20.5T408 576q0-29 20-49.5t50-20.5q29 0 49.5 20.5T548 576q0 29-20.5 49.5T478 646Zm2-70Zm-36 331h71l15-111q34-8 65-25t55-44l106 46 31-59-92-67q4-18 7-35.5t3-35.5q0-18-2.5-35.5T695 505l93-67-32-59-105 46q-23-28-54-47t-67-23l-14-110h-72l-13 110q-36 6-67.5 24.5T308 425l-104-46-32 59 91 66q-4 18-7 36t-3 36q0 18 3 36.5t7 35.5l-91 66 32 59 104-46q25 26 56.5 44t66.5 26l13 110Z"/></svg>
        </div>
      </button>`;
		//Above lines should make the same HTML as in index.js (homepage), bottom of markup
		main.insertBefore(divOuter, document.querySelector(".tabContainerWrapper").nextSibling);

		initMap(true, getLocationToUse());
		removeCurrentLocationLoader(); //If present
	}

	//Remove map element and add list elements
	if (localStorage.getItem("overviewForm") === "list") {
		function htmlToElement(html) {
			var template = document.createElement("template");
			html = html.trim();
			template.innerHTML = html;
			return template.content.firstChild;
		}

		mapNodeElements.forEach((element) => {
			element.remove();
		});
		const locationNotificationBar = htmlToElement(
			`<div data-barLocationNotification id="barLocationNotificationList" class="barLocationNotification noDisplay"></div>`,
		);
		main.insertBefore(
			locationNotificationBar,
			document.querySelector(".tabContainerWrapper").nextSibling,
		);
		const div = document.createElement("div");
		div.id = "list";
		//Above lines should make the same HTML as in index.js (homepage), bottom of markup
		main.insertBefore(div, document.querySelector(".sectionHeader"));

		initList(true, getLocationToUse());
	}

	showLocationPreferenceOptions();
}

export function acquireLocation() {
	return new Promise((resolve) => {
		if (localStorage.getItem("locationPreference") === "none") {
			resolve();
			return;
		}

		if (localStorage.getItem("locationPreference") === "low") {
			fetch(`/getClientIPLocation`)
				.then((response) => response.json())
				.then((lowAccuracyLocation) => {
					if (lowAccuracyLocation.lowEnoughIPScore) {
						globalThis.lowAccuracyLocation = {
							lat: lowAccuracyLocation.lat,
							lon: lowAccuracyLocation.lon,
						};
						resolve(globalThis.lowAccuracyLocation);
					} else {
						globalThis.lowAccuracyLocation = "failed";
						resolve();
					}
				})
				.catch((error) => {
					console.log(error);
					globalThis.lowAccuracyLocation = "failed";
					resolve();
				});
			return;
		}

		if (localStorage.getItem("locationPreference") === "high") {
			if (globalThis.highAccuracyLocation) {
				resolve(globalThis.highAccuracyLocation);
				return;
			}

			if (navigator.geolocation) {
				//Loader is automatically shown when user chose for high location accuracy, in function addCurrentLocationMarker local line 13

				if (localStorage.getItem("highAccuracyLocation")) {
					//Location is stored so the map can instantly be panned. Then acquire a new location (which can take some time) and pan to that newly acquired location
					globalThis.highAccuracyLocation = JSON.parse(
						localStorage.getItem("highAccuracyLocation"),
					).location;
					resolve(globalThis.highAccuracyLocation);
				}
				navigator.geolocation.getCurrentPosition(
					(position) => {
						//Renew the location saved in storage
						globalThis.highAccuracyLocation = {
							lat: position.coords.latitude,
							lon: position.coords.longitude,
						};
						if (
							localStorage.getItem("highAccuracyLocation") &&
							localStorage.getItem("overviewForm") === "map"
						) {
							if (!globalThis.blockPanningOnReload)
								panMapToLocation(globalThis.highAccuracyLocation, true);
						}
						//First check in above line might seem obsolete, but it is actually needed to check if the location is acquired for the second time (then true)
						//If not, the map doesn't need to be panned because this is already done by the first resolve from ln 129. If done anyway, it will cause an error message

						localStorage.setItem(
							"highAccuracyLocation",
							JSON.stringify({ location: globalThis.highAccuracyLocation, time: new Date() }),
						);
						resolve(globalThis.highAccuracyLocation);

						removeCurrentLocationLoader(); //Remove loader again (in function because it is called when switching from list to map as well)
					},
					() => {
						//User blocked location access
						globalThis.highAccuracyLocation = "failed";
						resolve();
					},
					{ enableHighAccuracy: true },
				);
			} else {
				//Location access unavailable
				globalThis.highAccuracyLocation = "failed";
				resolve();
			}
		}
	});
}

export function showLocationPreferenceOptions() {
	const locationPreferenceSelector = document.querySelector("[data-locationPreference]"); //Don't remove semi-colon

	(() => {
		//Dumped in this anonymous function just to be able to return out of it. Function determines where to show the location options
		if (globalThis.lowAccuracyLocation === "failed") {
			//User on VPN
			//Always show in bar
			showInBar("low", ["high", "none"]);
			return;
		}
		if (globalThis.highAccuracyLocation === "failed") {
			//User blocked location access or location access is not available in browser
			//Always show in bar
			showInBar("high", ["low", "none"]);
			return;
		}
		if (localStorage.getItem("userChoseLocationPreference") === "0") {
			//Prompt because user has net set his/her preference
			//Show all options, dependend if user is in map or list mode
			if (localStorage.getItem("overviewForm") === "map") showInMap();
			if (localStorage.getItem("overviewForm") === "list")
				showInBar("none", ["high", "low", "none"]);
			return;
		}
		if (
			globalThis.lowAccuracyLocation !== "failed" &&
			globalThis.highAccuracyLocation !== "failed" &&
			localStorage.getItem("locationPreference") !== "none"
		) {
			//When is no problem and the acquirement went fine
			//Bind the popup anyway in map, so user can change it like when they first visited the page.
			//Only difference is that the popup won't display automatically which is handled in (SEARCH FOR setTimeout(() => document.querySelector(".circleCurrentLocation").click(), 2000)
			// in functions.js)
			if (localStorage.getItem("overviewForm") === "map") showInMap();
			return;
		}
	})();

	function showInMap() {
		const popup = document
			.querySelector("[data-templateMapLocationPreferencePopup]")
			.cloneNode(true).content;
		if (localStorage.getItem("userChoseLocationPreference") === "1") {
			popup.querySelector("[data-locationPopUpTitle]").innerText = "Gebruik locatie wijzigen:";
			popup.querySelector("[data-popupLocationPrefferenceLow]").innerText = "Geschatte locatie";
		}

		popup
			.querySelector("[data-popupLocationPrefferenceHigh]")
			.addEventListener("click", () =>
				changeLocationPreference(locationPreferenceSelector, "high"),
			);
		popup
			.querySelector("[data-popupLocationPrefferenceLow]")
			.addEventListener("click", () => changeLocationPreference(locationPreferenceSelector, "low"));
		popup
			.querySelector("[data-popupLocationPrefferenceNone]")
			.addEventListener("click", () =>
				changeLocationPreference(locationPreferenceSelector, "none"),
			);
		const popUpObject = new mapboxgl.Popup({
			offset: 13,
			closeButton: false,
			anchor: "bottom",
		}).setDOMContent(popup);
		globalThis.currentLocationMarkerObject.setPopup(popUpObject).addTo(map);

		popUpObject.on("close", () => {
			//After popup for the location preference is clicked away, show the popup at the closest location
			//to show user to click on windsock (only if user hasn't seen this yet). Main logic for this feature is at mapOrListInit.js at lines 87 - 116
			if (localStorage.getItem("popupClickOnLocationSuggestionShowed") === "0")
				closestMarkerToCurrentLocationObject.togglePopup();
		});

		if (
			localStorage.getItem("userChoseLocationPreference") === "0" &&
			!document.querySelector(".messageBox")
		) {
			//Only open popup when Welcome box has been clicked away
			setTimeout(() => document.querySelector(".circleCurrentLocation").click(), 2000);
		}
	}

	function showInBar(failedToDetermineLocationOfType, alternativeOptionsToDisplay) {
		//Helper function and data object used in this function
		function capitalizeFirstLetter(string) {
			return string[0].toUpperCase() + string.slice(1);
		}
		const options = {
			high: "hoge nauwkeurigheid gebruiken (aanbevolen)",
			low: "geschatte locatie gebruiken",
			none: "maak geen gebruik van je huidige locatie",
		};
		Object.keys(options).forEach((option) => {
			if (localStorage.getItem("locationPreference") === option)
				options[option] = `blijf ${options[option]}`; //To indicate which location type is currently used
		});

		//Show the bar and scroll to top
		if (document.querySelector("[data-barLocationNotification]"))
			document.querySelector("[data-barLocationNotification]").classList.remove("noDisplay");
		document.body.scrollTop = 0; // For Safari
		document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

		const stringsToConcat = [];
		alternativeOptionsToDisplay.forEach((alternativeOption) => {
			stringsToConcat.push(options[alternativeOption]);
		});
		let finalString;

		if (failedToDetermineLocationOfType === "high")
			finalString = "Niet mogelijk locatie te bepalen (geblokkeerd of niet beschikbaar). ";
		if (failedToDetermineLocationOfType === "low")
			finalString = "Niet mogelijk geschatte locatie te bepalen. ";
		if (failedToDetermineLocationOfType === "none")
			finalString = "Afstand gebaseerd op geschatte locatie. "; //Only for list

		//Format the individual strings and add them together to finalString with comma's and 'en' word
		if (stringsToConcat.length === 2)
			finalString += `<span data-barLocationPreferenceChange>${capitalizeFirstLetter(stringsToConcat[0])}</span> of <span data-barLocationPreferenceChange>${stringsToConcat[1]}</span>.`;
		if (stringsToConcat.length === 3)
			finalString += `<span data-barLocationPreferenceChange>${capitalizeFirstLetter(stringsToConcat[0])}</span>, <span data-barLocationPreferenceChange>${stringsToConcat[1]}</span> of <span data-barLocationPreferenceChange>${stringsToConcat[2]}</span>.`;

		//Set string in bar HTML
		document.querySelector("[data-barLocationNotification]").innerHTML = finalString;

		//Add event listeners for when options are clicked
		document.querySelectorAll("[data-barLocationPreferenceChange]").forEach((option) => {
			option.addEventListener("click", () => {
				Object.keys(options).forEach((alternativeOptionInSettings) => {
					if (option.innerHTML.toLowerCase() === options[alternativeOptionInSettings])
						changeLocationPreference(locationPreferenceSelector, alternativeOptionInSettings);
				});
			});
		});
	}
}

export function getLocationToUse() {
	if (localStorage.getItem("locationPreference") === "none") return null;
	if (
		localStorage.getItem("locationPreference") === "low" &&
		globalThis.lowAccuracyLocation !== "failed"
	)
		return globalThis.lowAccuracyLocation;
	if (
		localStorage.getItem("locationPreference") === "high" &&
		globalThis.highAccuracyLocation !== "failed"
	)
		return globalThis.highAccuracyLocation;

	return null;
}

export function changeLocationPreference(selector, changeSelectorValueFirstTo) {
	if (changeSelectorValueFirstTo) selector.value = changeSelectorValueFirstTo;

	localStorage.setItem("locationPreference", selector.value);
	localStorage.setItem("userChoseLocationPreference", "1");
	location.reload();
}

export function distanceLocationToCurrentLocation(lat1, lon1, lat2, lon2) {
	if (lat1 === lat2 && lon1 === lon2) return 0;
	else {
		const radlat1 = (Math.PI * lat1) / 180;
		const radlat2 = (Math.PI * lat2) / 180;
		const theta = lon1 - lon2;
		const radtheta = (Math.PI * theta) / 180;

		let dist =
			Math.sin(radlat1) * Math.sin(radlat2) +
			Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) dist = 1;
		dist = Math.acos(dist);
		dist = (dist * 180) / Math.PI;
		dist = dist * 60 * 1.1515;
		dist = dist * 1.609344;

		return Math.round(dist);
	}
}

export function changeTiles(map, tilesSelector, seaMapCheckbox) {
	let value;
	if (seaMapCheckbox.checked === false) {
		value = "0";
	} else {
		value = "1";
	}

	localStorage.setItem("tiles", tilesSelector.value);
	localStorage.setItem("seaMap", value);

	if (map)
		history.replaceState(
			{},
			"De Wind Nu",
			`?x=${map.getCenter().lng}&y=${map.getCenter().lat}&z=${map.getZoom()}`,
		);
	location.reload();
}

// Helper functions

function removeCurrentLocationLoader() {
	if (localStorage.getItem("overviewForm") === "list") return;
	//Remove loader from current location marker,
	if (map instanceof Element || !document.querySelector("#acquireLocationLoader"))
		setTimeout(
			() => document.querySelector("#acquireLocationLoader").classList.add("noDisplay"),
			1000,
		);
	else document.querySelector("#acquireLocationLoader").classList.add("noDisplay");
	//(1) First case: the map variable is an element, which means that the map object has not been initialized by Mapbox. This happens when the
	//browser popup is displayed for the location preference. We therefore wait 1 second for the map to initialize and then remove the loader.
	//(2) Second case: (every other case) the map had already been initialized so the loader can  be removed instantly.
}
