import { directionToLetters } from "../globalFunctions.js"
import { parseISO, isValid, differenceInMinutes, differenceInSeconds } from "https://esm.run/date-fns"
import { initMap, initList } from "./mapOrListInit.js"

function setLocURL(map) {
  const precisePosition = [map.getCenter().lng, map.getCenter().lat, map.getZoom()]
  history.replaceState({}, "De Wind Nu", `?x=${precisePosition[0]}&y=${precisePosition[1]}&z=${precisePosition[2]}`)
}

export function changeOverviewForm(selector, e) {

  let clickedOption
  if (e) clickedOption = e.target.innerText

  //Check if the overviewForm is changed at all
  if (clickedOption == "Kaart" && localStorage.getItem("overviewForm") == "map") return
  if (clickedOption == "Lijst" && localStorage.getItem("overviewForm") == "list") return

  if (clickedOption == "Kaart") selector.value = "map"
  if (clickedOption == "Lijst") selector.value = "list"

  document.querySelector("[data-map]").classList.toggle("deselected")
  document.querySelector("[data-list]").classList.toggle("deselected")
  localStorage.setItem("overviewForm", selector.value)

  const main = document.getElementsByTagName("main")[0]
  const mapNodeElements = [document.getElementById("mapWrapper")]
  const listNodeElements = [document.getElementById("list")]

  //Remove list elements and add map element
  if (localStorage.getItem("overviewForm") == "map") {
    listNodeElements.forEach(element => element.remove())

    const divOuter = document.createElement("div")
    divOuter.id = "mapWrapper"
    divOuter.innerHTML = `<div id="map"></div>`
    main.prepend(divOuter)

    initMap(true)
  }

  //Remove map element and add list elements
  if (localStorage.getItem("overviewForm") == "list") {
    mapNodeElements.forEach(element => element.remove())

    const div = document.createElement("div")
    div.id = "list"
    main.prepend(div)

    initList(true)
  }
}

export function convertValueToBft(value) {
  const ranges = [1, 4, 7, 11, 17, 22, 28, 34, 41, 48, 56, 64]

  //Check first extreme: windforce 0
  if (value < ranges[0]) {
    return "0"
  }

  //Loop through every windforce and check if the value falls into that category
  for (let j = 0; j < (ranges.length - 2); j++) {
    if ((value >= ranges[j]) && (value < ranges[j + 1])) {
      return (j + 1).toString()
    }
  }

  //Check second extreme: windforce 12
  if (value >= ranges[11]) {
    return "12"
  }
}

function setMeasurementData(container, dataLocation, returnNode) {

  //if returnNode == true, the function returns the node elements to be set in the popup, for the list this is not
  //necessary as the node elements are already in the DOM

  let windSpeed, windGusts, windDirection, windDirectionLetters = "",
    directionArrow = ""

  const windSpeedGustsElement = container.querySelector(".windSpeedGusts"),
    windDirectionElement = container.querySelector(".windDirection"),
    relativeTimeElement = container.querySelector(".relativeTime")

  windSpeed = dataLocation.windSpeed
  if (windSpeed || windSpeed == 0) {
    if (unit !== "Bft") windSpeed = (units[unit].factor * windSpeed).toFixed(decimals)
    else windSpeed = convertValueToBft(windSpeed)
  } else windSpeed = "-"
  windGusts = dataLocation.windGusts
  if (windGusts || windGusts == 0) {
    if (unit !== "Bft") windGusts = (units[unit].factor * windGusts).toFixed(decimals)
    else windGusts = convertValueToBft(windGusts)
  } else windGusts = "-"
  windDirection = dataLocation.windDirection
  if (windDirection || windDirection == 0) {
    windDirection = windDirection.toFixed(0)
    windDirectionLetters = directionToLetters(windDirection)
    directionArrow = `<span style="transform: rotate(${windDirection}deg);" title="Windrichting" class="material-symbols-rounded listElementArrow">&#xf1e3;</span>`
  } else windDirection = "-"

  windSpeedGustsElement.innerText = `${windSpeed.replace(".", ",")} / ${windGusts.replace(".", ",")} ${unit}`
  windDirectionElement.innerHTML = `${windDirection}° / ${windDirectionLetters} ${directionArrow}`

  const timeStampString = dataLocation.timeStamp
  const timeStamp = parseISO(timeStampString)
  if (isValid(timeStamp)) {
    const relativeMinutes = differenceInMinutes(new Date(), timeStamp)

    if (relativeMinutes == 0) {
      const relativeSeconds = differenceInSeconds(new Date(), timeStamp)
      relativeTimeElement.innerText = `${relativeSeconds} seconden geleden`
    } else if (relativeMinutes == 1) {
      relativeTimeElement.innerText = `${relativeMinutes} minuut geleden`
    } else {
      relativeTimeElement.innerText = `${relativeMinutes} minuten geleden`
    }
  }

  if (returnNode) return container
}

function checkOldMeasurement(dataLocation) {

  const timeStampString = dataLocation.timeStamp
  const timeStamp = parseISO(timeStampString)
  if (isValid(timeStamp)) {
    const relativeMinutes = differenceInMinutes(new Date(), timeStamp)
    if (relativeMinutes > 24 * 60) return true
  }

}

//Functions for map
export function changeTiles(map, tilesSelector, seaMapCheckbox) {

  let value
  if (seaMapCheckbox.checked == false) {
    value = "0"
  } else {
    value = "1"
  }

  localStorage.setItem("tiles", tilesSelector.value)
  localStorage.setItem("seaMap", value)

  if (map) setLocURL(map)
  location.reload()
}

export function getMapBoxStyle(tilesObjects) {
  if (localStorage.getItem("tiles") == "auto") {
    if (localStorage.getItem("theme") == "auto") {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "mapbox://styles/mapbox/dark-v10"
      } else return tilesObjects.OpenStreetMap
    } else if (localStorage.getItem("theme") == "dark") return "mapbox://styles/mapbox/dark-v10"
    else if (localStorage.getItem("theme") == "light") return tilesObjects.OpenStreetMap
  }
  if (localStorage.getItem("tiles") == "OpenStreetMap") return tilesObjects.OpenStreetMap
  if (localStorage.getItem("tiles") == "Mapbox custom") return "mapbox://styles/feikescholtens/ckuhc8nha9jft18s0muhoy0zf"
  if (localStorage.getItem("tiles") == "Mapbox licht") return "mapbox://styles/mapbox/light-v10"
  if (localStorage.getItem("tiles") == "Mapbox donker") return "mapbox://styles/mapbox/dark-v10"
  if (localStorage.getItem("tiles") == "Satelliet") return "mapbox://styles/mapbox/satellite-v9"
  if (localStorage.getItem("tiles") == "Satelliet met plaatsnamen en wegen") return "mapbox://styles/mapbox/satellite-streets-v11"
}

export const tilesObjects = {
  "OpenStreetMap": {
    "version": 8,
    "sources": {
      "openstreetmap": {
        "type": "raster",
        "tiles": ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        "tileSize": 256,
        "attribution": "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
      }
    },
    "layers": [{
      "id": "openstreetmap",
      "type": "raster",
      "source": "openstreetmap"
    }]
  },
  "OpenSeaMap": {
    "id": "openseamap",
    "type": "raster",
    "source": {
      "type": "raster",
      "tiles": ["https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"],
      "tileSize": 256
    },
    "layers": [{
      "id": "openseamap",
      "type": "raster",
      "source": "openseamap"
    }],
    "minzoom": 0,
    "maxzoom": 22,
    "paint": {
      "raster-opacity": 0.8
    }
  }
}

export function createPopupIDAndMarkerElement(location, locationID) {
  let popupId, marker = document.createElement("div")
  marker.className = "markerContainer"
  marker.innerHTML = `<div class="marker" title="${location.name}"></div>`

  const dataset = Object.keys(location.datasets)[0]
  if (["VLINDER", "Rijkswaterstaat", "KNMI", "MVB"].includes(dataset)) {
    marker.classList.add(`markerContainer${dataset}`)
    Array.from(marker.getElementsByTagName("div")).forEach(element => { element.classList.add(dataset) })
    popupId = `popup${dataset}`
  } else {
    marker.classList.add(`markerContainerOther`)
    Array.from(marker.getElementsByTagName("div")).forEach(element => { element.classList.add("Other") })
    popupId = `popupOther`
  }

  Array.from(marker.getElementsByTagName("div")).forEach(element => { element.id = locationID })

  return [popupId, marker]
}

export function panMap(addMarker) {
  //Fit map (if a location is not set in the URL as parameters), based on location (if not available fit to all markers)

  if (globalThis.position) {
    const latBounds = [position.coords.latitude + 0.35, position.coords.latitude - 0.35],
      lonBounds = [position.coords.longitude + 0.35, position.coords.longitude - 0.35]
    fitMap(map, latBounds, lonBounds)

    addCurrentLocationMarker(addMarker)
  } else {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        globalThis.position = position

        const latBounds = [position.coords.latitude + 0.35, position.coords.latitude - 0.35],
          lonBounds = [position.coords.longitude + 0.35, position.coords.longitude - 0.35]
        fitMap(map, latBounds, lonBounds)

        addCurrentLocationMarker(addMarker)
      }, () => fitMap(map, markersLats, markersLons), { enableHighAccuracy: true })
    } else fitMap(map, markersLats, markersLons)
  }

}

export function fitMap(map, markersLats, markersLons) {
  map.fitBounds([
    [markersLons.at(-1), markersLats[0]], // southwestern corner of the bounds
    [markersLons[0], markersLats.at(-1)] // northeastern corner of the bounds
  ], {
    padding: 40
  })
}

export function addCurrentLocationMarker(addMarker) {
  if (!addMarker) return

  if (!globalThis.position) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        globalThis.position = position

        addToMap()
      }, () => {}, { enableHighAccuracy: true })
    }
  } else addToMap()

  function addToMap() {
    const marker = document.createElement("div")
    marker.classList.add("circleCurrentLocation")
    new mapboxgl.Marker(marker).setLngLat([position.coords.longitude, position.coords.latitude]).addTo(map)
  }
}

export function setOverviewMapData(data, map) {

  Object.keys(data).forEach(dataSource => {

    globalThis.data[dataSource] = { ...data[dataSource] }

    if (!map._loaded) map.on("load", () => {
      for (const locationID in data[dataSource]) {
        if (!checkOldMeasurement(data[dataSource][locationID])) {
          addMarkerArrowToMap(data[dataSource][locationID], dataSource, locationID)
          updatePopUp(data[dataSource][locationID], locationID)
        }
      }
    })
    else {
      for (const locationID in data[dataSource]) {
        if (!checkOldMeasurement(data[dataSource][locationID])) {
          addMarkerArrowToMap(data[dataSource][locationID], dataSource, locationID)
          updatePopUp(data[dataSource][locationID], locationID)
        }
      }
    }

  })

}

function addMarkerArrowToMap(dataLocation, dataSource, locationID) {
  const arrow = document.createElement("div")
  arrow.classList.add("arrowArm")
  arrow.classList.add(dataSource)

  if (dataLocation) {
    arrow.style.transform = `translateX(calc(-0.3 * var(--markerSize))) rotate(${dataLocation.windDirection}deg)`

    if (!dataLocation.windSpeed && dataLocation !== 0) return
    const windSpeedBft = convertValueToBft(dataLocation.windSpeed)
    document.getElementById(locationID).innerText = windSpeedBft
  }

  document.getElementById(locationID).parentNode.prepend(arrow)
}

function updatePopUp(dataLocation, locationID) {
  const container = popUps[locationID].Node
  const popUpWithData = setMeasurementData(container, dataLocation, true)

  popUps[locationID].Object.setDOMContent(popUpWithData)
}

//Functions for list

export function setOverviewListData(data) {

  Object.keys(data).forEach(dataSource => {

    globalThis.data[dataSource] = { ...data[dataSource] }

    for (const locationID in data[dataSource]) {
      if (!checkOldMeasurement(data[dataSource][locationID])) {
        setMeasurementData(document.querySelector(`[id="${locationID}"]`), data[dataSource][locationID], false)
      }
    }

  })
}