import { fitMap, windPage, changeTiles, setOverviewData } from "./functions.js"
import { displayPopUpWithName } from "../jsPopUps/functions.js"
import { displayPopUpFeedback } from "../jsPopUps/feedback.js"
const tilesObjects = await fetch("./OSMTiles.json").then(response => response.json())

const tilesSelector = document.querySelector("[data-tiles]"),
  seaMapCheckbox = document.querySelector("[data-seaMap]")

if (!localStorage.getItem("tiles")) localStorage.setItem("tiles", "0")
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
mapboxgl.accessToken = "pk.eyJ1IjoiZmVpa2VzY2hvbHRlbnMiLCJhIjoiY2t1aDlpZWEwMGhkYTJwbm02Zmt0Y21sOCJ9.PA3iy-3LQhjCkfxhxL2zUw";

const mapOptions = {
  container: "map",
  center: center,
  zoom: zoom
}
if (parseInt(tilesSelector.value) == 0) mapOptions.style = tilesObjects.OpenStreetMap
if (parseInt(tilesSelector.value) == 1) mapOptions.style = "mapbox://styles/feikescholtens/ckuhc8nha9jft18s0muhoy0zf"
const map = new mapboxgl.Map(mapOptions)
map.touchZoomRotate.disableRotation()
map.on("load", () => {
  if (localStorage.getItem("seaMap") == "1") map.addLayer(tilesObjects.OpenSeaMap)
})

fetch("getOverviewData/Rijkswaterstaat").then(response => response.json()).then(data => setOverviewData(data))
fetch("getOverviewData/KNMI").then(response => response.json()).then(data => setOverviewData(data))
fetch("getOverviewData/MVB").then(response => response.json()).then(data => setOverviewData(data))

data.forEach(item => {
  if (!excludeZoomFitMarkers.includes(item.id)) {
    markersLats.push(item.lat)
    markersLons.push(item.lon)
  }

  let popupId, marker = document.createElement("div")
  marker.className = "markerContainer"
  marker.innerHTML = `<div class="marker" title="${item.name}"></div>`

  if (item.datasets.Rijkswaterstaat) {
    Array.from(marker.getElementsByTagName("div")).forEach(element => { element.classList.add("RWS") })
    popupId = "popupRWS"
    marker.style.zIndex = 1
  } else if (item.datasets.KNMI) {
    Array.from(marker.getElementsByTagName("div")).forEach(element => { element.classList.add("KNMI") })
    popupId = "popupKNMI"
    marker.style.zIndex = 2
  } else if (item.datasets.MVB) {
    Array.from(marker.getElementsByTagName("div")).forEach(element => { element.classList.add("MVB") })
    popupId = "popupMVB"
    marker.style.zIndex = 3
  }
  Array.from(marker.getElementsByTagName("div")).forEach(element => { element.id = item.id })

  const button = document.createElement("button")
  button.className = `windPageButton ${popupId}`
  button.innerText = item.name
  button.addEventListener("click", () => windPage(item.id, map))

  new mapboxgl.Marker(marker).setLngLat([item.lon, item.lat]).setPopup(
    new mapboxgl.Popup({
      offset: 13
    }).setDOMContent(button)
  ).addTo(map)
})

markersLats.sort()
markersLons.sort()

if (window.location.search == "") fitMap(map, markersLats, markersLons)
history.replaceState({}, "De Wind Nu", "/")
document.querySelectorAll("[data-mapfit]").forEach(element => element.addEventListener("click", () => fitMap(map, markersLats, markersLons)))

document.querySelector("[data-about]").addEventListener("click", () => displayPopUpWithName("about"))
document.querySelector("[data-disclaimer]").addEventListener("click", () => displayPopUpWithName("disclaimer"))
document.querySelector("[data-feedback]").addEventListener("click", () => displayPopUpFeedback())
document.querySelector("[data-credit]").addEventListener("click", () => displayPopUpWithName("credit"))
document.querySelector("[data-contact]").addEventListener("click", () => displayPopUpWithName("contact"))