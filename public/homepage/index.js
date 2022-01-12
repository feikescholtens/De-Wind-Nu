import { fitMap, windPage, changeTiles } from "./functions.js"
import { contact } from "../jsPopUps/contact.js"
import { credit } from "../jsPopUps/credit.js"
import { feedback } from "../jsPopUps/feedback.js"
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

data.forEach(item => {
  if (!excludeZoomFitMarkers.includes(item.id)) {
    markersLats.push(item.lat)
    markersLons.push(item.lon)
  }

  let popupId, marker = document.createElement("div")
  marker.className = "marker"

  if (item.datasets.Rijkswaterstaat) {
    marker.id = "RWS"
    popupId = "popupRWS"
  } else if (item.datasets.KNMI) {
    marker.id = "KNMI"
    popupId = "popupKNMI"
  } else if (item.datasets.MVB) {
    marker.id = "MVB"
    popupId = "popupMVB"
  }

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

document.querySelector("[data-feedback]").addEventListener("click", feedback)
document.querySelector("[data-credit]").addEventListener("click", credit)
document.querySelector("[data-contact]").addEventListener("click", contact)