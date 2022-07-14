import { getMapBoxStyle, createPopupIDAndMarkerElement, fitMap, redirectToWindPage, setOverviewMapData, setOverviewListData, tilesObjects } from "./functions.js"

export async function initMap(dataAlreadyFetched) {

  const urlParams = new URLSearchParams(window.location.search)
  const center = [urlParams.get("x") || 5.160544, urlParams.get("y") || 52.182725]
  const zoom = urlParams.get("z") || 6
  const excludeZoomFitMarkers = ["3318", "4806", "0727", "1843", "9057", "8609", "6823"]
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

  if (!dataAlreadyFetched) {
    fetch("getOverviewData/VLINDER").then(response => response.json()).then(dataOverview => setOverviewMapData({ VLINDER: dataOverview }, map))
    fetch("getOverviewData/Rijkswaterstaat").then(response => response.json()).then(dataOverview => setOverviewMapData({ Rijkswaterstaat: dataOverview }, map))
    fetch("getOverviewData/KNMI").then(response => response.json()).then(dataOverview => setOverviewMapData({ KNMI: dataOverview }, map))
    fetch("getOverviewData/MVB").then(response => response.json()).then(dataOverview => setOverviewMapData({ MVB: dataOverview }, map))
  } else setOverviewMapData(globalThis.data, map)

  for (const id in data) {
    if (!excludeZoomFitMarkers.includes(id)) {
      markersLats.push(data[id].lat)
      markersLons.push(data[id].lon)
    }

    let [popupId, marker] = createPopupIDAndMarkerElement(data[id], id)

    const popup = document.querySelector("[data-templateMapPopup]").cloneNode(true).content
    popup.querySelector("div").id = id
    const button = popup.querySelector("button")
    button.className = `windPageButton ${popupId}`
    button.innerText = data[id].name
    button.addEventListener("click", () => redirectToWindPage(id, map))

    globalThis.popUps[id] = { Node: popup.querySelector("div") }

    const popUpObject = new mapboxgl.Popup({ offset: 13 }).setDOMContent(popup)
    new mapboxgl.Marker(marker).setLngLat([data[id].lon, data[id].lat]).setPopup(popUpObject).addTo(map)

    globalThis.popUps[id].Object = popUpObject

  }

  [markersLats, markersLons].forEach(array => array.sort())

  if (window.location.search == "") fitMap(map, markersLats, markersLons)
  history.replaceState({}, "De Wind Nu", "/")
}

export function initList(dataAlreadyFetched) {

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => makeTable(position), () => makeTable(), { enableHighAccuracy: true })
  } else {
    makeTable()
  }

  function makeTable(position) {
    for (const id in data) {
      let distanceKM = "-"
      if (position) distanceKM = distance(position.coords.latitude, position.coords.longitude, data[id].lat, data[id].lon)

      data[id].distance = distanceKM
    }

    const dataSorted = Object.entries(data)
    if (position) dataSorted.sort((a, b) => { return a[1].distance - b[1].distance }) //If position is retrieved, sort by distance
    else dataSorted.sort((a, b) => { return a[1].name.localeCompare(b[1].name) }) //If not, sort alphabetically

    for (let i = 0; i < dataSorted.length; i++) {
      let [popupId, marker] = createPopupIDAndMarkerElement(dataSorted[i][1], dataSorted[i][0])

      const listItem = document.querySelector("[data-templateListItem]").cloneNode(true).content
      const button = listItem.querySelector("button")
      button.className = `windPageButton ${marker.querySelector("div").classList[1]} ${popupId}`
      button.innerText = dataSorted[i][1].name
      button.addEventListener("click", () => redirectToWindPage(dataSorted[i][0], null))

      if (position) listItem.querySelector(".distance").innerText = dataSorted[i][1].distance + " km"

      listItem.querySelector("div").id = dataSorted[i][0]
      document.getElementById("list").append(listItem)
    }

    if (!dataAlreadyFetched) {
      fetch("getOverviewData/VLINDER").then(response => response.json()).then(dataOverview => setOverviewListData({ VLINDER: dataOverview }))
      fetch("getOverviewData/Rijkswaterstaat").then(response => response.json()).then(dataOverview => setOverviewListData({ Rijkswaterstaat: dataOverview }))
      fetch("getOverviewData/KNMI").then(response => response.json()).then(dataOverview => setOverviewListData({ KNMI: dataOverview }))
      fetch("getOverviewData/MVB").then(response => response.json()).then(dataOverview => setOverviewListData({ MVB: dataOverview }))
    } else setOverviewListData(globalThis.data)
  }
}

function distance(lat1, lon1, lat2, lon2) {
  if ((lat1 == lat2) && (lon1 == lon2)) return 0
  else {
    const radlat1 = Math.PI * lat1 / 180
    const radlat2 = Math.PI * lat2 / 180
    const theta = lon1 - lon2
    const radtheta = Math.PI * theta / 180

    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
    if (dist > 1) dist = 1
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    dist = dist * 1.609344

    return Math.round(dist)
  }
}