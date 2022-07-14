import { changeTiles, changeOverviewForm, setOverviewListData, fitMap, setOverviewMapData } from "./functions.js"
import { redirect, updateLocalVariables, changeTheme, changeShowBar, units, changeUnit, changeDecimals, setGeneralSettings, addUIListeners } from "../globalFunctions.js"
import { initMap, initList } from "./mapOrListInit.js"
redirect()
updateLocalVariables()

globalThis.data = {},
  globalThis.unit = localStorage.getItem("unit"),
  globalThis.decimals, //Is set in setGeneralSettings function
  globalThis.units = units,
  globalThis.popUps = {},
  globalThis.markersLats = [],
  globalThis.markersLons = []

//Selectors for general settings
const themeSelector = document.querySelector("[data-theme]"),
  showBarSelector = document.querySelector("[data-showBar]"),
  unitSelector = document.querySelector("[data-unit]"),
  decimalsSelector = document.querySelector("[data-decimals]")

//Selectors for homepage specific settings
const overviewFormSelector = document.querySelector("[data-overviewFormUnderSettings]"),
  tilesSelector = document.querySelector("[data-tiles]"),
  seaMapCheckbox = document.querySelector("[data-seaMap]")

//Sets the options in the settingstable for the ones in local storage
//General settings
setGeneralSettings()
//Homepage specific settings
overviewFormSelector.value = localStorage.getItem("overviewForm")
tilesSelector.value = localStorage.getItem("tiles")
if (localStorage.getItem("seaMap") == "1") seaMapCheckbox.checked = true
overviewFormSelector.value = localStorage.getItem("overviewForm")

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
tilesSelector.onchange = () => changeTiles(globalThis.map, tilesSelector, seaMapCheckbox);
seaMapCheckbox.onchange = () => changeTiles(globalThis.map, tilesSelector, seaMapCheckbox)

if (localStorage.getItem("overviewForm") == "map") initMap(false)
if (localStorage.getItem("overviewForm") == "list") initList(false)

addUIListeners()

//Listener for logo and title
document.querySelectorAll("[data-mapfit]").forEach(element => element.addEventListener("click", () => {
  if (localStorage.getItem("overviewForm") == "map") fitMap(map, markersLats, markersLons)
  if (localStorage.getItem("overviewForm") == "list") location.reload()
}))