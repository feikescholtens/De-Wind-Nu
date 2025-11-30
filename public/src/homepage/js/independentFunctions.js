// Functions that don't depend on other local files to avoid circular dependencies

export function addCurrentLocationMarker(addMarker, lat, lon) {
	if (!addMarker) return;

	if (globalThis.currentLocationMarkerObject) {
		globalThis.currentLocationMarkerObject.setLngLat([lon, lat]);
		return;
	}

	const markerWrapper = document.createElement("div");
	const marker = document.createElement("div");
	const loader = document.createElement("span");
	marker.classList.add("circleCurrentLocation");
	loader.id = "acquireLocationLoader";
	if (localStorage.getItem("locationPreference") !== "high") loader.classList.add("noDisplay"); //Only show loader when user chose for high location accuracy, because then a new location is being requested

	markerWrapper.append(marker);
	markerWrapper.append(loader);

	globalThis.currentLocationMarkerObject = new mapboxgl.Marker(markerWrapper)
		.setLngLat([lon, lat])
		.addTo(map);
}

export function convertValueToBft(value) {
	const ranges = [1, 4, 7, 11, 17, 22, 28, 34, 41, 48, 56, 64];

	//Check first extreme: windforce 0
	if (value < ranges[0]) {
		return "0";
	}

	//Loop through every windforce and check if the value falls into that category
	for (let j = 0; j < ranges.length - 1; j++) {
		if (value >= ranges[j] && value < ranges[j + 1]) {
			return (j + 1).toString();
		}
	}

	//Check second extreme: windforce 12
	if (value >= ranges[11]) {
		return "12";
	}
}

export function fitMapToMarkers(map, markersLats, markersLons) {
	map.fitBounds(
		[
			[markersLons.at(-1), markersLats[0]], // southwestern corner of the bounds
			[markersLons[0], markersLats.at(-1)], // northeastern corner of the bounds
		],
		{
			padding: 40,
		},
	);
}
