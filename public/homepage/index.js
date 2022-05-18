import { fitMap, windPage, changeTiles, setOverviewData } from "./functions.js"
import { displayPopUpWithName } from "../jsPopUps/functions.js"
import { displayPopUpFeedback } from "../jsPopUps/feedback.js"
import { redirect, updateLocalVariables } from "../globalFunctions.js"
redirect()
updateLocalVariables()
const tilesObjects = await fetch("./OSMTiles.json").then(response => response.json())

const tilesSelector = document.querySelector("[data-tiles]"),
  seaMapCheckbox = document.querySelector("[data-seaMap]")

if (!localStorage.getItem("hadFirstVisit")) {
  displayPopUpWithName("welkom")
  localStorage.setItem("hadFirstVisit", "1")
}
if (!localStorage.getItem("tiles")) localStorage.setItem("tiles", "OpenStreetMap")
if (!localStorage.getItem("seaMap")) localStorage.setItem("seaMap", "1")

tilesSelector.value = localStorage.getItem("tiles")
if (localStorage.getItem("seaMap") == "1") seaMapCheckbox.checked = true

tilesSelector.onchange = () => changeTiles(map, tilesSelector, seaMapCheckbox)
seaMapCheckbox.onchange = () => changeTiles(map, tilesSelector, seaMapCheckbox)

const urlParams = new URLSearchParams(window.location.search)
const center = [urlParams.get("x") || 5.160544, urlParams.get("y") || 52.182725]
const zoom = urlParams.get("z") || 6
const excludeZoomFitMarkers = ["3318", "4806", "0727", "1843", "9057", "8609", "6823"]
let markersLats = [],
  markersLons = []
mapboxgl.accessToken = "pk.eyJ1IjoiZmVpa2VzY2hvbHRlbnMiLCJhIjoiY2t1aDlpZWEwMGhkYTJwbm02Zmt0Y21sOCJ9.PA3iy-3LQhjCkfxhxL2zUw"

const mapOptions = {
  container: "map",
  center: center,
  zoom: zoom
}
if (tilesSelector.value == "OpenStreetMap") mapOptions.style = tilesObjects.OpenStreetMap
if (tilesSelector.value == "Mapbox") mapOptions.style = "mapbox://styles/feikescholtens/ckuhc8nha9jft18s0muhoy0zf"
const map = new mapboxgl.Map(mapOptions)
map.touchZoomRotate.disableRotation()
map.on("load", () => {
  if (localStorage.getItem("seaMap") == "1") map.addLayer(tilesObjects.OpenSeaMap)
})

fetch("getOverviewData/VLINDER").then(response => response.json()).then(data => setOverviewData(data))
fetch("getOverviewData/Rijkswaterstaat").then(response => response.json()).then(data => setOverviewData(data))
fetch("getOverviewData/KNMI").then(response => response.json()).then(data => setOverviewData(data))
fetch("getOverviewData/MVB").then(response => response.json()).then(data => setOverviewData(data))

for (const id in data) {
  if (!excludeZoomFitMarkers.includes(id)) {
    markersLats.push(data[id].lat)
    markersLons.push(data[id].lon)
  }

  let popupId, marker = document.createElement("div")
  marker.className = "markerContainer"
  marker.innerHTML = `<div class="marker" title="${data[id].name}"></div>`

  if (data[id].datasets.VLINDER) {
    Array.from(marker.getElementsByTagName("div")).forEach(element => { element.classList.add("VLINDER") })
    popupId = "popupVLINDER"
    marker.style.zIndex = 1
  } else if (data[id].datasets.Rijkswaterstaat) {
    Array.from(marker.getElementsByTagName("div")).forEach(element => { element.classList.add("RWS") })
    popupId = "popupRWS"
    marker.style.zIndex = 2
  } else if (data[id].datasets.KNMI) {
    Array.from(marker.getElementsByTagName("div")).forEach(element => { element.classList.add("KNMI") })
    popupId = "popupKNMI"
    marker.style.zIndex = 3
  } else if (data[id].datasets.MVB) {
    Array.from(marker.getElementsByTagName("div")).forEach(element => { element.classList.add("MVB") })
    popupId = "popupMVB"
    marker.style.zIndex = 4
  } else {
    Array.from(marker.getElementsByTagName("div")).forEach(element => { element.classList.add("Other") })
    popupId = "popupOther"
    marker.style.zIndex = 5
  }
  Array.from(marker.getElementsByTagName("div")).forEach(element => { element.id = id })

  const button = document.createElement("button")
  button.className = `windPageButton ${popupId}`
  button.innerText = data[id].name
  button.addEventListener("click", () => windPage(id, map))

  new mapboxgl.Marker(marker).setLngLat([data[id].lon, data[id].lat]).setPopup(
    new mapboxgl.Popup({
      offset: 13
    }).setDOMContent(button)
  ).addTo(map)
}

markersLats.sort()
markersLons.sort()

if (window.location.search == "") fitMap(map, markersLats, markersLons)
history.replaceState({}, "De Wind Nu", "/")
document.querySelectorAll("[data-mapfit]").forEach(element => element.addEventListener("click", () => fitMap(map, markersLats, markersLons)))

document.querySelector("[data-about]").addEventListener("click", () => displayPopUpWithName("over"))
document.querySelector("[data-disclaimer]").addEventListener("click", () => displayPopUpWithName("disclaimer"))
document.querySelector("[data-feedback]").addEventListener("click", () => displayPopUpFeedback())
document.querySelector("[data-credit]").addEventListener("click", () => displayPopUpWithName("credit"))
document.querySelector("[data-contact]").addEventListener("click", () => displayPopUpWithName("contact"))