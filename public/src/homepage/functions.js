import { directionToLetters } from "../globalFunctions.js"
import { parseISO, isValid, differenceInMinutes, differenceInSeconds } from "date-fns"
import { initMap, initList } from "./mapOrListInit.js"

export function setLocURL(map) {
  const precisePosition = [map.getCenter().lng, map.getCenter().lat, map.getZoom()]
  history.replaceState({}, "De Wind Nu", `?x=${precisePosition[0]}&y=${precisePosition[1]}&z=${precisePosition[2]}`)
}

export function changeOverviewForm(selector, e) {

  let clickedOption
  if (e) clickedOption = e.target.textContent.replace(/\s/g, "") //When using tabs
  else clickedOption = selector.value //When using selector in settings

  //Check if the overviewForm is changed at all
  if (["Kaart", "map"].includes(clickedOption) && localStorage.getItem("overviewForm") == "map") return
  if (["Lijst", "list"].includes(clickedOption) && localStorage.getItem("overviewForm") == "list") return

  if (["Kaart", "map"].includes(clickedOption)) {
    selector.value = "map"
    document.querySelector("[data-map]").classList.add("active")
    document.querySelector("[data-list]").classList.remove("active")
    document.querySelector(".tabIndicator").style.left = `calc(0 * 80px)`
  }
  if (["Lijst", "list"].includes(clickedOption)) {
    selector.value = "list"
    document.querySelector("[data-map]").classList.remove("active")
    document.querySelector("[data-list]").classList.add("active")
    document.querySelector(".tabIndicator").style.left = `calc(1 * 80px + 5px)`
  }

  localStorage.setItem("overviewForm", selector.value)

  const main = document.getElementsByTagName("main")[0]
  const mapNodeElements = [document.getElementById("mapWrapper")]
  const listNodeElements = [document.getElementById("list"), document.querySelector("#barLocationNotificationList")]

  //Remove list elements and add map element
  if (localStorage.getItem("overviewForm") == "map") {
    listNodeElements.forEach(element => element.remove())

    const divOuter = document.createElement("div")
    divOuter.id = "mapWrapper"
    divOuter.innerHTML = `<div data-barLocationNotification id="barLocationNotificationMap" class="barLocationNotification noDisplay"></div>
    <div id="map"></div>
    <button id="settingsButton" class="noDisplay" aria-label="settings">
        <div title="Scroll naar de instellingen" class="noSelect" id="iconSettings">
          <svg xmlns="http://www.w3.org/2000/svg" height="42" viewBox="0 96 960 960" width="42"><path d="M552 1001H408q-18 0-32-11t-16-29l-15-94q-13-4-29.5-13.5T288 835l-86 41q-17 8-34.5 2T141 855L68 725q-10-16-5.5-33.5T81 663l80-58q-1-6-1.5-14.5T159 576q0-6 .5-14.5T161 547l-80-59q-14-11-18.5-28.5T68 427l73-130q10-15 27.5-21.5T202 277l88 40q10-8 26-17t29-13l15-97q2-18 16-29t32-11h144q18 0 32 11t16 29l15 96q13 5 29.5 13.5T672 317l86-40q16-8 34-2t27 22l74 129q10 16 5.5 34T879 488l-81 57q1 7 2 15.5t1 15.5q0 7-1 15t-2 15l81 57q14 11 18.5 28.5T893 725l-75 130q-9 17-26 23t-34-2l-87-41q-11 9-26.5 18.5T615 867l-15 94q-2 18-16 29t-32 11Zm-74-295q54 0 92-38t38-92q0-54-38-92t-92-38q-54 0-92 38t-38 92q0 54 38 92t92 38Zm0-60q-30 0-50-20.5T408 576q0-29 20-49.5t50-20.5q29 0 49.5 20.5T548 576q0 29-20.5 49.5T478 646Zm2-70Zm-36 331h71l15-111q34-8 65-25t55-44l106 46 31-59-92-67q4-18 7-35.5t3-35.5q0-18-2.5-35.5T695 505l93-67-32-59-105 46q-23-28-54-47t-67-23l-14-110h-72l-13 110q-36 6-67.5 24.5T308 425l-104-46-32 59 91 66q-4 18-7 36t-3 36q0 18 3 36.5t7 35.5l-91 66 32 59 104-46q25 26 56.5 44t66.5 26l13 110Z"/></svg>
        </div>
      </button>`
    //Above lines should make the same HTML as in index.js (homepage), bottom of markup
    main.insertBefore(divOuter, document.querySelector(".tabContainerWrapper").nextSibling);

    initMap(true, getLocationToUse())
    removeCurrentLocationLoader() //If present
  }

  //Remove map element and add list elements
  if (localStorage.getItem("overviewForm") == "list") {
    function htmlToElement(html) {
      var template = document.createElement('template')
      html = html.trim()
      template.innerHTML = html
      return template.content.firstChild
    }

    mapNodeElements.forEach(element => element.remove())
    const locationNotificationBar = htmlToElement(`<div data-barLocationNotification id="barLocationNotificationList" class="barLocationNotification noDisplay"></div>`)
    main.insertBefore(locationNotificationBar, document.querySelector(".tabContainerWrapper").nextSibling)
    const div = document.createElement("div")
    div.id = "list"
    //Above lines should make the same HTML as in index.js (homepage), bottom of markup
    main.insertBefore(div, document.querySelector(".sectionHeader"))

    initList(true, getLocationToUse())
  }

  showLocationPreferenceOptions()
}

export function acquireLocation() {
  return new Promise(async (resolve, reject) => {

    if (localStorage.getItem("locationPreference") === "none") resolve()
    if (localStorage.getItem("locationPreference") === "low") {

      const lowAccuracyLocation = await fetch(`/getClientIPLocation`)
        .catch(error => {
          console.log(error)
          globalThis.lowAccuracyLocation = "failed"
          resolve()
        })
        .then(response => { return response.json() })

      if (lowAccuracyLocation.lowEnoughIPScore) {
        globalThis.lowAccuracyLocation = { lat: lowAccuracyLocation.lat, lon: lowAccuracyLocation.lon }
        resolve(globalThis.lowAccuracyLocation)
      } else {
        globalThis.lowAccuracyLocation = "failed"
        resolve()
      }

    }
    if (localStorage.getItem("locationPreference") === "high") {

      if (globalThis.highAccuracyLocation) resolve(globalThis.highAccuracyLocation)
      else {
        if (navigator.geolocation) {

          //Loader is automatically shown when user chose for high location accuracy, in function addCurrentLocationMarker local line 13

          if (localStorage.getItem("highAccuracyLocation")) { //Location is stored so the map can instantly be panned. Then acquire a new location (which can take some time) and pan to that newly acquired location
            globalThis.highAccuracyLocation = JSON.parse(localStorage.getItem("highAccuracyLocation")).location
            resolve(globalThis.highAccuracyLocation)
          }
          navigator.geolocation.getCurrentPosition((position) => { //Renew the location saved in storage
            globalThis.highAccuracyLocation = { lat: position.coords.latitude, lon: position.coords.longitude }
            if (localStorage.getItem("highAccuracyLocation") && localStorage.getItem("overviewForm") === "map") {
              if (!globalThis.blockPanningOnReload) panMapToLocation(globalThis.highAccuracyLocation, true)
            }
            //First check in above line might seem obsolete, but it is actually needed to check if the location is acquired for the second time (then true)
            //If not, the map doesn't need to be panned because this is already done by the first resolve from ln 129. If done anyway, it will cause an error message

            localStorage.setItem("highAccuracyLocation", JSON.stringify({ location: globalThis.highAccuracyLocation, time: new Date() }))
            resolve(globalThis.highAccuracyLocation)

            removeCurrentLocationLoader() //Remove loader again (in function because it is called when switching from list to map as well)

          }, () => { //User blocked location access
            globalThis.highAccuracyLocation = "failed"
            resolve()
          }, { enableHighAccuracy: true })
        } else {
          //Location access unavailable     
          globalThis.highAccuracyLocation = "failed"
          resolve()
        }
      }

    }

  })
}

export function showLocationPreferenceOptions() {
  const locationPreferenceSelector = document.querySelector("[data-locationPreference]"); //Don't remove semi-colon

  (() => { //Dumped in this anonymous function just to be able to return out of it. Function determines where to show the location options
    if (globalThis.lowAccuracyLocation === "failed") { //User on VPN
      //Always show in bar
      showInBar("low", ["high", "none"])
      return
    }
    if (globalThis.highAccuracyLocation === "failed") { //User blocked location access or location access is not available in browser
      //Always show in bar
      showInBar("high", ["low", "none"])
      return
    }
    if (localStorage.getItem("userChoseLocationPreference") === "0") { //Prompt because user has net set his/her preference
      //Show all options, dependend if user is in map or list mode
      if (localStorage.getItem("overviewForm") === "map") showInMap()
      if (localStorage.getItem("overviewForm") === "list") showInBar("none", ["high", "low", "none"])
      return
    }
    if (globalThis.lowAccuracyLocation !== "failed" && globalThis.highAccuracyLocation !== "failed" && localStorage.getItem("locationPreference") !== "none") { //When is no problem and the acquirement went fine
      //Bind the popup anyway in map, so user can change it like when they first visited the page.
      //Only difference is that the popup won't display automatically which is handled in (SEARCH FOR setTimeout(() => document.querySelector(".circleCurrentLocation").click(), 2000)    
      // in functions.js)
      if (localStorage.getItem("overviewForm") === "map") showInMap()
      return
    }
  })()

  function showInMap() {
    const popup = document.querySelector("[data-templateMapLocationPreferencePopup]").cloneNode(true).content
    if (localStorage.getItem("userChoseLocationPreference") === "1") {
      popup.querySelector("[data-locationPopUpTitle]").innerText = "Gebruik locatie wijzigen:"
      popup.querySelector("[data-popupLocationPrefferenceLow]").innerText = "Geschatte locatie"
    }

    popup.querySelector("[data-popupLocationPrefferenceHigh]").addEventListener("click", () => changeLocationPreference(locationPreferenceSelector, "high"))
    popup.querySelector("[data-popupLocationPrefferenceLow]").addEventListener("click", () => changeLocationPreference(locationPreferenceSelector, "low"))
    popup.querySelector("[data-popupLocationPrefferenceNone]").addEventListener("click", () => changeLocationPreference(locationPreferenceSelector, "none"))
    const popUpObject = new mapboxgl.Popup({ offset: 13, closeButton: false, anchor: "bottom" }).setDOMContent(popup)
    globalThis.currentLocationMarkerObject.setPopup(popUpObject).addTo(map)

    popUpObject.on("close", () => { //After popup for the location preference is clicked away, show the popup at the closest location
      //to show user to click on windsack (only if user hasn't seen this yet). Main logic for this feature is at mapOrListInit.js at lines 87 - 116
      if (localStorage.getItem("popupClickOnLocationSuggestionShowed") == "0")
        closestMarkerToCurrentLocationObject.togglePopup()
    })

    if (localStorage.getItem("userChoseLocationPreference") === "0" && !document.querySelector(".messageBox")) { //Only open popup when Welcome box has been clicked away
      setTimeout(() => document.querySelector(".circleCurrentLocation").click(), 2000)
    }
  }

  function showInBar(failedToDetermineLocationOfType, alternativeOptionsToDisplay) {

    //Helper function and data object used in this function
    function capitalizeFirstLetter(string) { return string[0].toUpperCase() + string.slice(1) }
    const options = { high: "hoge nauwkeurigheid gebruiken (aanbevolen)", low: "geschatte locatie gebruiken", none: "maak geen gebruik van je huidige locatie" }
    Object.keys(options).forEach(option => {
      if (localStorage.getItem("locationPreference") === option) options[option] = `blijf ${options[option]}` //To indicate which location type is currently used
    })

    //Show the bar and scroll to top
    if (document.querySelector("[data-barLocationNotification]")) document.querySelector("[data-barLocationNotification]").classList.remove("noDisplay")
    document.body.scrollTop = 0 // For Safari
    document.documentElement.scrollTop = 0 // For Chrome, Firefox, IE and Opera

    const stringsToConcat = []
    alternativeOptionsToDisplay.forEach(alternativeOption => stringsToConcat.push(options[alternativeOption]))
    let finalString

    if (failedToDetermineLocationOfType == "high") finalString = "Niet mogelijk locatie te bepalen (geblokkeerd of niet beschikbaar). "
    if (failedToDetermineLocationOfType == "low") finalString = "Niet mogelijk geschatte locatie te bepalen. "
    if (failedToDetermineLocationOfType == "none") finalString = "Afstand gebaseerd op geschatte locatie. " //Only for list

    //Format the individual strings and add them together to finalString with comma's and 'en' word
    if (stringsToConcat.length == 2)
      finalString += `<span data-barLocationPreferenceChange>${capitalizeFirstLetter(stringsToConcat[0])}</span> of <span data-barLocationPreferenceChange>${stringsToConcat[1]}</span>.`
    if (stringsToConcat.length == 3)
      finalString += `<span data-barLocationPreferenceChange>${capitalizeFirstLetter(stringsToConcat[0])}</span>, <span data-barLocationPreferenceChange>${stringsToConcat[1]}</span> of <span data-barLocationPreferenceChange>${stringsToConcat[2]}</span>.`

    //Set string in bar HTML
    document.querySelector("[data-barLocationNotification]").innerHTML = finalString

    //Add event listeners for when options are clicked
    document.querySelectorAll("[data-barLocationPreferenceChange]").forEach(option => {
      option.addEventListener("click", () => {
        Object.keys(options).forEach(alternativeOptionInSettings => {
          if (option.innerHTML.toLowerCase() == options[alternativeOptionInSettings]) changeLocationPreference(locationPreferenceSelector, alternativeOptionInSettings)
        })
      })
    })

  }
}

export function getLocationToUse() {
  if (localStorage.getItem("locationPreference") === "none") return null
  if (localStorage.getItem("locationPreference") === "low" && globalThis.lowAccuracyLocation !== "failed") return globalThis.lowAccuracyLocation
  if (localStorage.getItem("locationPreference") === "high" && globalThis.highAccuracyLocation !== "failed") return globalThis.highAccuracyLocation

  return null
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
  if (windSpeed != undefined) {
    if (unit !== "Bft") windSpeed = (units[unit].factor * windSpeed).toFixed(decimals)
    else windSpeed = convertValueToBft(windSpeed)
  } else windSpeed = "-"
  windGusts = dataLocation.windGusts
  if (windGusts != undefined) {
    if (unit !== "Bft") windGusts = (units[unit].factor * windGusts).toFixed(decimals)
    else windGusts = convertValueToBft(windGusts)
  } else windGusts = "-"
  windDirection = dataLocation.windDirection
  if (windDirection != undefined) {
    windDirection = windDirection.toFixed(0)
    windDirectionLetters = directionToLetters(windDirection)
    directionArrow = `<div style="transform: rotate(${windDirection}deg);" title="Windrichting" class="listElementArrow">
    <svg xmlns="http://www.w3.org/2000/svg" height="25" viewBox="0 96 960 960" width="25"><path d="M480 974q-9 0-17.5-3T447 960L208 721q-15-14-15-33.5t15-33.5q13-14 32-14t33 14l160 160V198q0-20 13.5-33t33.5-13q20 0 33.5 13.5T527 199v615l160-160q13-13 32.5-13.5T753 654q14 14 14 33.5T753 721L513 960q-7 8-15.5 11t-17.5 3Z"/></svg>
    </div>`
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

export function changeLocationPreference(selector, changeSelectorValueFirstTo) {
  if (changeSelectorValueFirstTo) selector.value = changeSelectorValueFirstTo

  localStorage.setItem("locationPreference", selector.value)
  localStorage.setItem("userChoseLocationPreference", "1")
  location.reload()
}

export function distanceLocationToCurrentLocation(lat1, lon1, lat2, lon2) {
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

//Functions for map
function removeCurrentLocationLoader() {
  if (localStorage.getItem("overviewForm") == "list") return
  //Remove loader from current location marker,
  if (map instanceof Element || !document.querySelector("#acquireLocationLoader")) setTimeout(() => document.querySelector("#acquireLocationLoader").classList.add("noDisplay"), 1000)
  else document.querySelector("#acquireLocationLoader").classList.add("noDisplay")
  //(1) First case: the map variable is an element, which means that the map object has not been initialized by Mapbox. This happens when the
  //browser popup is displayed for the location preference. We therefore wait 1 second for the map to initialize and then remove the loader.
  //(2) Second case: (every other case) the map had already been initialized so the loader can  be removed instantly.
}

export function determineCenterToZoomTo(whatToDetermine, removeEdgeOperaLocation) {
  let x, y, z

  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get("x")) { //Highest priority, occurs when changing tiles
    x = parseFloat(urlParams.get("x"))
    y = parseFloat(urlParams.get("y"))
    z = parseFloat(urlParams.get("z"))
  } else if (localStorage.getItem("edgeOperaMapLocation") && (window.navigator.userAgent.indexOf("Edg") > -1 || (navigator.userAgent.match(/Opera|OPR\//) ? true : false))) {
    //Medium priority, occurs when
    //a user is referred from a wind-page. This is only triggered when using the Edge or Opera browser, since 
    //window.history(-1) (in the wind page) in Edge and Opera actually RELOADS the homepage, so the map pans and zooms the normal way instead of
    //"remembering" the previously panned to location. Chrome, Safari, Firefox actually load the page from memory, so these values 
    //will never be read from localStorage. 
    //To prevent from reading this everytime the page loads (localStorage is persistant of course), delete the location from localStorage after
    //this function has ran for the second time (first time to return center, second time to return zoom level).
    const location = JSON.parse(localStorage.getItem("edgeOperaMapLocation"))
    x = location.x
    y = location.y
    z = location.z

    globalThis.blockPanningOnReload = true
    if (removeEdgeOperaLocation) localStorage.removeItem("edgeOperaMapLocation")
  } else { //Lowest priority. When there's nothing known about the previously panned to location.
    x = 5.160544
    y = 52.182725
    z = 6
  }

  if (whatToDetermine === "center") return [x, y]
  if (whatToDetermine === "zoom") return z
}

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
        "tileSize": 512 / 2,
        "tiles": ["https://retina-tiles.p.rapidapi.com/local/osm@2x/v1/{z}/{x}/{y}.png?rapidapi-key=aad550bd32msh735b5ac070fdf09p13faeejsn889accf115b2"],
        "attribution": "Map tiles © <a target='_blank' href='https://www.maptilesapi.com/retina-tiles/'>Retina Tiles API</a> | Map data © <a target='_blank' href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors.",
        "tilesFallback": ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], //Automatically being set as a fallback
        "attributionFallback": "&copy; <a target='_blank' href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors" //Automatically being set as a fallback
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

export function panMapToLocation(locationToUse, addMarker) {
  //Fit map (if a location is not set in the URL as parameters), based on location (if not available fit to all markers)
  if (!locationToUse || locationToUse == "failed") return

  addCurrentLocationMarker(addMarker, locationToUse.lat, locationToUse.lon)

  const bound = 0.2
  let factors = [0.5, 0.5]
  //Normally the bound to which we extend the map around the current location is the same top to bottom
  //However when we prompt the user for location preference, we top bound needs to get bigger and the botto bound smaller
  //Code inside if-statement calculates the factors by which we need to adjust
  if (localStorage.getItem("userChoseLocationPreference") === "0") {
    const estimatedHeightLocationPopup = document.querySelector(".circleCurrentLocation").clientHeight * 20
    const remainingPixelsToSpaceOut = document.querySelector("#mapWrapper").clientHeight - estimatedHeightLocationPopup

    const pixelsMarkerToBottom = remainingPixelsToSpaceOut / 2
    const pixelsMarkerToTop = remainingPixelsToSpaceOut / 2 + estimatedHeightLocationPopup

    const factorBottom = pixelsMarkerToBottom / document.querySelector("#mapWrapper").clientHeight
    const factorTop = pixelsMarkerToTop / document.querySelector("#mapWrapper").clientHeight

    factors = [factorTop, factorBottom]
  }

  const latBounds = [locationToUse.lat + (2 * bound) * factors[0], locationToUse.lat - (2 * bound) * factors[1]],
    lonBounds = [locationToUse.lon + bound, locationToUse.lon - bound]
  fitMapToMarkers(map, latBounds, lonBounds)
}

export function fitMapToMarkers(map, markersLats, markersLons) {
  map.fitBounds([
    [markersLons.at(-1), markersLats[0]], // southwestern corner of the bounds
    [markersLons[0], markersLats.at(-1)] // northeastern corner of the bounds
  ], {
    padding: 40
  })
}

export function addCurrentLocationMarker(addMarker, lat, lon) {
  if (!addMarker) return

  if (globalThis.currentLocationMarkerObject) {
    globalThis.currentLocationMarkerObject.setLngLat([lon, lat])
    return
  }

  const markerWrapper = document.createElement("div")
  const marker = document.createElement("div")
  const loader = document.createElement("span")
  marker.classList.add("circleCurrentLocation")
  loader.id = "acquireLocationLoader"
  if (localStorage.getItem("locationPreference") !== "high") loader.classList.add("noDisplay") //Only show loader when user chose for high location accuracy, because then a new location is being requested

  markerWrapper.append(marker)
  markerWrapper.append(loader)

  globalThis.currentLocationMarkerObject = new mapboxgl.Marker(markerWrapper).setLngLat([lon, lat]).addTo(map)
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

    if (dataLocation.windSpeed == undefined) return
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