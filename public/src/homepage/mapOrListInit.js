import { getMapBoxStyle, createPopupIDAndMarkerElement, fitMapToMarkers, panMapToLocation, addCurrentLocationMarker, setOverviewMapData, setOverviewListData, tilesObjects, determineCenterToZoomTo } from "./functions.js"

export async function initMap(dataAlreadyFetched, locationToUse) {

  document.querySelector("#settingsButton").addEventListener("click", () => {
    const scrollDiv = document.querySelector(".sectionHeader").offsetTop;
    window.scrollTo({ top: scrollDiv, behavior: 'smooth' });
  })

  const center = determineCenterToZoomTo("center")
  const zoom = determineCenterToZoomTo("zoom", true)
  const excludeZoomFitMarkers = ["3318", "4806", "0727", "1843", "9057", "8609", "6823", "2214", "4371", "6660", "6019"]
  mapboxgl.accessToken = "pk.eyJ1IjoiZmVpa2VzY2hvbHRlbnMiLCJhIjoiY2t1aDlpZWEwMGhkYTJwbm02Zmt0Y21sOCJ9.PA3iy-3LQhjCkfxhxL2zUw"

  const mapOptions = {
    container: "map",
    center: center,
    zoom: zoom,
    style: getMapBoxStyle(tilesObjects)
  }

  globalThis.map = new mapboxgl.Map(mapOptions)
  map.touchZoomRotate.disableRotation()
  map.on("load", () => { if (localStorage.getItem("seaMap") == "1") map.addLayer(tilesObjects.OpenSeaMap) })
  map.once("render", () => { document.querySelector("#settingsButton").classList.remove("noDisplay") })
  map.on("error", async (error) => {
    if (error.error.status === 429) {
      map.getSource('openstreetmap').tiles = tilesObjects.OpenStreetMap.sources.openstreetmap.tilesFallback
      map.getSource('openstreetmap').attribution = tilesObjects.OpenStreetMap.sources.openstreetmap.attributionFallback

      map.triggerRepaint()
      map._controls[0]._updateAttributions()

      console.log("Ignore above error message (from ajax.js:143). Switched tile URL to one with unlimited requests, bacause a) API limit reached, b) OR users exceeded the rate limit per second. In both cases we get a 429 error!")
    }
  })

  if (!dataAlreadyFetched) {
    fetch("getOverviewData/VLINDER").then(response => response.json()).then(dataOverview => setOverviewMapData({ VLINDER: dataOverview }, map))
    fetch("getOverviewData/RWS").then(response => response.json()).then(dataOverview => setOverviewMapData({ RWS: dataOverview }, map))
    fetch("getOverviewData/KNMI").then(response => response.json()).then(dataOverview => setOverviewMapData({ KNMI: dataOverview }, map))
    fetch("getOverviewData/MVB").then(response => response.json()).then(dataOverview => setOverviewMapData({ MVB: dataOverview }, map))
  } else setOverviewMapData(globalThis.data, map)

  const dataDistanceSorted = Object.keys(data).sort((a, b) => data[a].distance - data[b].distance)
  const closestLocationID = dataDistanceSorted[0]

  for (const id in data) {
    if (!excludeZoomFitMarkers.includes(id)) {
      markersLats.push(data[id].lat)
      markersLons.push(data[id].lon)
    }

    let [popupId, marker] = createPopupIDAndMarkerElement(data[id], id)

    const popup = document.querySelector("[data-templateMapPopup]").cloneNode(true).content
    popup.querySelector("div").id = id
    const button = popup.querySelector("button")
    button.className = `colouredButton ${popupId}`
    button.innerText = data[id].name
    button.addEventListener("click", () => {
      // ?x=${map.getCenter().lng}&y=${map.getCenter().lat}?z=${map.getZoom()}
      localStorage.setItem("edgeOperaMapLocation", JSON.stringify({ x: map.getCenter().lng, y: map.getCenter().lat, z: map.getZoom() }))
      window.location.assign(`${window.location.protocol}//${window.location.host}/wind/${id}`)
    })

    globalThis.popUps[id] = { Node: popup.querySelector("div") }

    const popUpObject = new mapboxgl.Popup({ offset: 13, closeButton: false }).setDOMContent(popup)
    const markerObject = new mapboxgl.Marker(marker).setLngLat([data[id].lon, data[id].lat])
    markerObject.setPopup(popUpObject).addTo(map)
    globalThis.popUps[id].Object = popUpObject

    if (id === closestLocationID) { globalThis.closestMarkerToCurrentLocationObject = markerObject }
  }

  [markersLats, markersLons].forEach(array => array.sort())

  if (center[0] === 5.160544 && center[1] === 52.182725) {
    if (locationToUse) panMapToLocation(locationToUse, true)
    else fitMapToMarkers(map, markersLats, markersLons)
  } else {
    history.replaceState({}, "De Wind Nu", "/")
    addCurrentLocationMarker(true, locationToUse.lat, locationToUse.lon)
  }

  //Show popup with instruction / suggestion to click on windsack to view more measurements on closest location
  //Code pieces that are linked to this functionality:
  //
  // functions.js lines 188 - 191
  // globalFunctions.js line 113
  if (localStorage.getItem("popupClickOnLocationSuggestionShowed") == "1") return //This suggestion has already been shown once

  const popupElement = document.createElement("div")
  popupElement.id = "popupSuggestionClickMarker"
  popupElement.classList = "popUp alwaysBlackText"
  popupElement.innerHTML = "Druk op een windzak voor de recentste meting. <br><br> Vervolgens kun je met de gekleurde knop alle metingen bekijken!"
  const popUpObject = new mapboxgl.Popup({ offset: 13, closeButton: false }).setDOMContent(popupElement)
  closestMarkerToCurrentLocationObject.setPopup(popUpObject)
  if (localStorage.getItem("userChoseLocationPreference") == "1") closestMarkerToCurrentLocationObject.togglePopup()

  const popUpObjectOriginal = globalThis.popUps[closestLocationID].Object

  closestMarkerToCurrentLocationObject._element.addEventListener("click", () => closestMarkerToCurrentLocationObject.setPopup(popUpObjectOriginal))
  popUpObject.once("close", () => {
    if (!document.querySelector("[data-locationpopuptitle]"))
      localStorage.setItem("popupClickOnLocationSuggestionShowed", "1")

    closestMarkerToCurrentLocationObject.setPopup(popUpObjectOriginal)
  })

  /////////

}

export function initList(dataAlreadyFetched, locationToUse) {

  const dataSorted = Object.entries(data)
  if (locationToUse) dataSorted.sort((a, b) => { return a[1].distance - b[1].distance }) //If position is retrieved, sort by distance
  else dataSorted.sort((a, b) => { return a[1].name.localeCompare(b[1].name) }) //If not, sort alphabetically

  for (let i = 0; i < dataSorted.length; i++) {
    let [popupId, marker] = createPopupIDAndMarkerElement(dataSorted[i][1], dataSorted[i][0])

    const listItem = document.querySelector("[data-templateListItem]").cloneNode(true).content
    const button = listItem.querySelector("button")
    button.className = `colouredButton ${marker.querySelector("div").classList[1]} ${popupId}`
    button.innerText = dataSorted[i][1].name
    button.addEventListener("click", () => window.location.assign(`${window.location.protocol}//${window.location.host}/wind/${dataSorted[i][0]}`))

    if (locationToUse) listItem.querySelector(".distance").innerText = dataSorted[i][1].distance + " km"

    listItem.querySelector("div").id = dataSorted[i][0]
    document.getElementById("list").append(listItem)
  }

  if (!dataAlreadyFetched) {
    fetch("getOverviewData/VLINDER").then(response => response.json()).then(dataOverview => setOverviewListData({ VLINDER: dataOverview }))
    fetch("getOverviewData/RWS").then(response => response.json()).then(dataOverview => setOverviewListData({ RWS: dataOverview }))
    fetch("getOverviewData/KNMI").then(response => response.json()).then(dataOverview => setOverviewListData({ KNMI: dataOverview }))
    fetch("getOverviewData/MVB").then(response => response.json()).then(dataOverview => setOverviewListData({ MVB: dataOverview }))
  } else setOverviewListData(globalThis.data)
}