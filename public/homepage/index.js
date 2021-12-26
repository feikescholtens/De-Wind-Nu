import { fitMap, windPage } from "./functions.js"
import { contact } from "../jsPopUps/contact.js"
import { credit } from "../jsPopUps/credit.js"
import { feedback } from "../jsPopUps/feedback.js"

const urlParams = new URLSearchParams(window.location.search)
const center = [urlParams.get("x") || 5.160544, urlParams.get("y") || 52.182725]
const zoom = urlParams.get("z") || 6
const excludeZoomFitMarkers = ["8971", "2417", "2367", "8287", "5643", "2468", "1919"]
let markersLats = [],
  markersLons = []
mapboxgl.accessToken = "pk.eyJ1IjoiZmVpa2VzY2hvbHRlbnMiLCJhIjoiY2t1aDlpZWEwMGhkYTJwbm02Zmt0Y21sOCJ9.PA3iy-3LQhjCkfxhxL2zUw";

const map = new mapboxgl.Map({
  container: "locations",
  style: "mapbox://styles/feikescholtens/ckuhc8nha9jft18s0muhoy0zf",
  center: center,
  zoom: zoom
})
map.touchZoomRotate.disableRotation()
map.on("load", async () => map.addLayer(await fetch("./OSMTiles.json").then(response => response.json()), "waterway-label"))

data.forEach((item) => {

  if (!excludeZoomFitMarkers.includes(item.id)) {
    markersLats.push(item.lat)
    markersLons.push(item.lon)
  }

  let popupId, marker = document.createElement("div")
  marker.className = "marker"

  if (item.datasets.KNMI) {
    marker.id = "KNMI"
    popupId = "popupKNMI"
  } else if (item.datasets.Rijkswaterstaat) {
    marker.id = "RWS"
    popupId = "popupRWS"
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
document.getElementById("logo").addEventListener("click", () => fitMap(map, markersLats, markersLons))
document.getElementById("title").addEventListener("click", () => fitMap(map, markersLats, markersLons))

document.getElementById("contact").addEventListener("click", contact)
document.getElementById("credit").addEventListener("click", credit)
document.getElementById("feedback").addEventListener("click", feedback)