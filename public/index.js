const urlParams = new URLSearchParams(window.location.search)
const center = [urlParams.get("x") || 5.160544, urlParams.get("y") || 52.182725]
const zoom = urlParams.get("z") || 6
const excludeZoomFitMarkers = ["8971", "2417", "2367", "8287", "5643", "2468", "1919"]

mapboxgl.accessToken = "pk.eyJ1IjoiZmVpa2VzY2hvbHRlbnMiLCJhIjoiY2t1aDlpZWEwMGhkYTJwbm02Zmt0Y21sOCJ9.PA3iy-3LQhjCkfxhxL2zUw";
let markersLats = [],
  markersLons = []
const map = new mapboxgl.Map({
  container: "locations",
  style: "mapbox://styles/feikescholtens/ckuhc8nha9jft18s0muhoy0zf",
  center: center,
  zoom: zoom
})
map.touchZoomRotate.disableRotation()

for (item of data) {

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

  new mapboxgl.Marker(marker).setLngLat([item.lon, item.lat]).setPopup(
    new mapboxgl.Popup({
      offset: 13
    }).setHTML(`<button class="windPageButton ${popupId}" onClick="windPage('${item.id}')">${item.name}</button>`)
  ).addTo(map)
}

markersLats.sort()
markersLons.sort()
let loaded = false
if (window.location.search == "") fitMap()

map.on('load', () => {
  map.addLayer({
    'id': 'openseamap',
    'type': 'raster',
    'source': {
      'type': "raster",
      'tiles': ['https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'],
      'tileSize': 256
    },
    "minzoom": 0,
    "maxzoom": 22,
    "paint": {
      "raster-opacity": .8
    }
  }, 'waterway-label')
})

let clickedPosition, letGoPosition

map.on('click', () => {
  clickedPosition = [map.getCenter().lng.toFixed(2), map.getCenter().lat.toFixed(2), map.getZoom().toFixed(2)]
})


map.on('idle', () => {

  letGoPosition = [map.getCenter().lng.toFixed(2), map.getCenter().lat.toFixed(2), map.getZoom().toFixed(2)]
  const mapMoved = JSON.stringify(clickedPosition) !== JSON.stringify(letGoPosition)

  if (loaded && mapMoved)
    history.replaceState({}, "De Wind Nu", `?x=${letGoPosition[0]}&y=${letGoPosition[1]}&z=${letGoPosition[2]}`)
  loaded = true

})

function fitMap() {
  map.fitBounds([
    [markersLons.at(-1), markersLats[0]], // southwestern corner of the bounds
    [markersLons[0], markersLats.at(-1)] // northeastern corner of the bounds
  ], {
    padding: 40
  })

  loaded = false
  history.replaceState({}, "De Wind Nu", "/")
}

function windPage(id) {
  window.location.assign(`${window.location.protocol}//${window.location.host}/wind/${id}`)
}