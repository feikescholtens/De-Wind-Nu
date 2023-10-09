//Rollup CSS imports, get extracted into stylesheet file
import "./styles.css"
import "../generalStyles.css"
import "../../assets/xus5meu.css"

import { changeTiles, changeOverviewForm, changeLocationPreference, setOverviewListData, fitMapToMarkers, panMapToLocation, setOverviewMapData, acquireLocation, showLocationPreferenceOptions, getLocationToUse, distanceLocationToCurrentLocation } from "./functions.js"
import { redirect, updateLocalVariables, changeTheme, changeShowBar, units, changeUnit, changeDecimals, setGeneralSettings, addUIListeners, handleTimeZoneWarning } from "../globalFunctions.js"
import { initMap, initList } from "./mapOrListInit.js"
redirect()
updateLocalVariables()
handleTimeZoneWarning()

globalThis.data = {},
  globalThis.unit = localStorage.getItem("unit"),
  globalThis.decimals, //Is set in setGeneralSettings function
  globalThis.units = units,
  globalThis.popUps = {},
  globalThis.closestMarkerToCurrentLocationObject = {},
  globalThis.markersLats = [],
  globalThis.markersLons = [],
  globalThis.lowAccuracyLocation,
  globalThis.highAccuracyLocation,
  globalThis.blockPanningOnReload = false

//Selectors for general settings
const themeSelector = document.querySelector("[data-theme]"),
  showBarSelector = document.querySelector("[data-showBar]"),
  unitSelector = document.querySelector("[data-unit]"),
  decimalsSelector = document.querySelector("[data-decimals]")

//Selectors for homepage specific settings
const overviewFormSelector = document.querySelector("[data-overviewFormUnderSettings]"),
  tilesSelector = document.querySelector("[data-tiles]"),
  seaMapCheckbox = document.querySelector("[data-seaMap]"),
  locationPreferenceSelector = document.querySelector("[data-locationPreference]")

//Sets the options in the settingstable for the ones in local storage
//General settings
setGeneralSettings()
//Homepage specific settings
overviewFormSelector.value = localStorage.getItem("overviewForm")
tilesSelector.value = localStorage.getItem("tiles")
if (localStorage.getItem("seaMap") == "1") seaMapCheckbox.checked = true
locationPreferenceSelector.value = localStorage.getItem("locationPreference")

//Listener functions for when settings are changed
//General settings
themeSelector.onchange = () => changeTheme(document.querySelector("[data-theme]").value)
showBarSelector.onchange = () => changeShowBar(showBarSelector)
unitSelector.onchange = () => {
  changeUnit(unitSelector, decimalsSelector)
  if (localStorage.getItem("overviewForm") == "map") setOverviewMapData(globalThis.data, map)
  if (localStorage.getItem("overviewForm") == "list") setOverviewListData(globalThis.data)
}
decimalsSelector.onchange = () => {
  changeDecimals(decimalsSelector)
  if (localStorage.getItem("overviewForm") == "map") setOverviewMapData(globalThis.data, map)
  if (localStorage.getItem("overviewForm") == "list") setOverviewListData(globalThis.data)
}
//Homepage specific settings
overviewFormSelector.onchange = () => changeOverviewForm(overviewFormSelector)
document.querySelector("[data-map]").addEventListener("click", (e) => changeOverviewForm(overviewFormSelector, e)) //in the select bar
document.querySelector("[data-list]").addEventListener("click", (e) => changeOverviewForm(overviewFormSelector, e)) //in the select bar
tilesSelector.onchange = () => changeTiles(globalThis.map, tilesSelector, seaMapCheckbox)
seaMapCheckbox.onchange = () => changeTiles(globalThis.map, tilesSelector, seaMapCheckbox)
locationPreferenceSelector.onchange = () => changeLocationPreference(locationPreferenceSelector)

//Initialize main UI's
acquireLocation().then((locationToUse) => {
  //Add the distance to the user's current location to the data object
  if (locationToUse) { for (const id in data) data[id].distance = distanceLocationToCurrentLocation(locationToUse.lat, locationToUse.lon, data[id].lat, data[id].lon) }

  if (localStorage.getItem("overviewForm") == "map") initMap(false, locationToUse)
  if (localStorage.getItem("overviewForm") == "list") initList(false, locationToUse)

  showLocationPreferenceOptions()
})

addUIListeners()

//Listener for logo and title
document.querySelectorAll("[data-mapfit]").forEach(element => element.addEventListener("click", () => {
  if (localStorage.getItem("overviewForm") == "map") {

    if (localStorage.getItem("locationPreference") === "none") { fitMapToMarkers(map, markersLats, markersLons); return; }

    const locationToUse = getLocationToUse()
    if (locationToUse && !map.getBounds().contains([locationToUse.lon, locationToUse.lat])) { panMapToLocation(locationToUse, false); return; }

    if (map.getZoom() > 7) { fitMapToMarkers(map, markersLats, markersLons); return; }

    panMapToLocation(locationToUse, false)
  }
  if (localStorage.getItem("overviewForm") == "list") location.reload()
}))