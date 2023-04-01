import { displayPopUpWithName } from "./jsPopUps/functions.js"
import { displayPopUpFeedback } from "./jsPopUps/feedback.js"
import { updateGraphs } from "./wind/js/graphOrTableUpdate.js"
import { updateCurrentWind } from "./wind/js/updateDisplayCurrentWind.js"
import { getTimezoneOffset } from "https://cdn.jsdelivr.net/npm/date-fns-tz/+esm"

export function setGeneralSettings() { //Sets the correct general settings under the "Instellingen" heading

  const themeSelector = document.querySelector("[data-theme]"),
    showBarSelector = document.querySelector("[data-showBar]"),
    unitSelector = document.querySelector("[data-unit]"),
    decimalsSelector = document.querySelector("[data-decimals]")

  themeSelector.value = localStorage.getItem("theme")
  if (localStorage.getItem("showBar") == "1") showBarSelector.checked = true
  else {
    //The overviewForm selector is set in the index.ejs to prevent it from flashing during pageload
    if (document.querySelector("[data-dataForm]")) document.querySelector("[data-dataForm]").style.display = "none"
  }
  unitSelector.value = localStorage.getItem("unit")
  if (unitSelector.value == 4) decimalsSelector.setAttribute("disabled", "disabled")
  decimalsSelector.value = localStorage.getItem("decimals")

  //Further processing for when the unit is set to "Bft"
  if (unitSelector.value == "Bft") {
    globalThis.decimals = 0
    document.querySelector("[data-decimals]").disabled = true
  } else globalThis.decimals = localStorage.getItem("decimals")

}

export const units = {
  "kn": {
    "naam": "Knopen",
    "factor": 1
  },
  "m/s": {
    "naam": "Meter per seconde",
    "factor": 0.514444444
  },
  "km/h": {
    "naam": "Kilometer per uur",
    "factor": 1.85200
  },
  "mph": {
    "naam": "Mijl per uur",
    "factor": 1.15077945
  },
  "Bft": {
    "naam": "Beaufort",
    "factor": 1,
    "ranges": [1, 4, 7, 11, 17, 22, 28, 34, 41, 48, 56, 64]
  }
}

export function directionToLetters(currentDirection) {

  let letters

  if (currentDirection < 11.25 || currentDirection > 348.75) letters = "N"
  else if ((currentDirection > 11.25) && (currentDirection < 33.75)) letters = "NNO"
  else if ((currentDirection > 33.75) && (currentDirection < 56.25)) letters = "NO"
  else if ((currentDirection > 56.25) && (currentDirection < 78.75)) letters = "ONO"
  else if ((currentDirection > 78.75) && (currentDirection < 101.25)) letters = "O"
  else if ((currentDirection > 101.25) && (currentDirection < 123.75)) letters = "OZO"
  else if ((currentDirection > 123.75) && (currentDirection < 146.25)) letters = "ZO"
  else if ((currentDirection > 146.25) && (currentDirection < 168.75)) letters = "ZZO"
  else if ((currentDirection > 168.75) && (currentDirection < 191.25)) letters = "Z"
  else if ((currentDirection > 191.25) && (currentDirection < 213.75)) letters = "ZZW"
  else if ((currentDirection > 213.75) && (currentDirection < 236.25)) letters = "ZW"
  else if ((currentDirection > 236.25) && (currentDirection < 258.75)) letters = "WZW"
  else if ((currentDirection > 258.75) && (currentDirection < 281.25)) letters = "W"
  else if ((currentDirection > 281.25) && (currentDirection < 303.75)) letters = "WNW"
  else if ((currentDirection > 303.75) && (currentDirection < 326.25)) letters = "NW"
  else if ((currentDirection > 326.25) && (currentDirection < 348.75)) letters = "NNW"

  return letters

}

export function redirect() {
  if (["over", "feedback", "credit", "contact", "disclaimer"].includes(location.hash.substring(1)))
    displayPopUpWithName(location.hash.substring(1))
}

export function handleTimeZoneWarning() {

  const validTimeZone = "Europe/Amsterdam"
  const UTCoffset_validTimeZone = getTimezoneOffset(validTimeZone) / (1000 * 60 * 60)

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const UTCoffset_userTimeZone = getTimezoneOffset(userTimeZone) / (1000 * 60 * 60)

  if (UTCoffset_validTimeZone !== UTCoffset_userTimeZone)
    alert(`De Wind Nu doesn't work as intended on your device!

Your detected time zone is '${userTimeZone}' but the only supported time zone is '${validTimeZone}' or other time zones with the same UTC (also known as Greenwich Mean Time) offset.

This means that all dates and times aren't displayed correctly. Timestamps of measurements and forecasts differ from their truly measured time in the Netherlands.

Support for more time zones hasn't been implemented yet because De Wind Nu only has stations that are located in the Netherlands.`)

}

export function updateLocalVariables() {
  //Setting local storage variables if never set before

  //Background / site functioning
  if (!localStorage.getItem("hadFirstVisit")) {
    displayPopUpWithName("welkom")
    localStorage.setItem("hadFirstVisit", "1")
  }
  //General settings
  //Theme setting is controlled in the index.ejs files to prevent flasing due to loading time
  if (!localStorage.getItem("showBar")) localStorage.setItem("showBar", 1)
  if (!localStorage.getItem("unit")) localStorage.setItem("unit", "kn")
  if (!localStorage.getItem("decimals")) localStorage.setItem("decimals", 1)

  //Homepage specific settings
  if (!localStorage.getItem("overviewForm")) localStorage.setItem("overviewForm", "map")
  if (!localStorage.getItem("tiles")) localStorage.setItem("tiles", "auto")
  if (!localStorage.getItem("seaMap")) localStorage.setItem("seaMap", 1)
  if (!localStorage.getItem("locationPreference")) localStorage.setItem("locationPreference", "low")
  if (!localStorage.getItem("userChoseLocationPreference")) localStorage.setItem("userChoseLocationPreference", "0")

  //Windpage specific settings
  if (!localStorage.getItem("dataForm")) localStorage.setItem("dataForm", "graphs")
  if (!localStorage.getItem("interpolation")) localStorage.setItem("interpolation", 0)
  if (!localStorage.getItem("tableSort")) localStorage.setItem("tableSort", "descending") //not under settings
  if (!localStorage.getItem("hiddenDatasets")) localStorage.setItem("hiddenDatasets", JSON.stringify({ //not under settings
    "Windsterkte": false,
    "Windvlagen": false,
    "Windrichting": false,
    "Windsterkte verwachting": false,
    "Windvlagen verwachting": false,
    "Windrichting verwachting": false
  }))

  //

  //Updating variables that changed in the code in storage, version indicated if remembered
  if (localStorage.getItem("dataForm") == "0") localStorage.setItem("dataForm", "graphs")
  if (localStorage.getItem("dataForm") == "1") localStorage.setItem("dataForm", "table")

  if (localStorage.getItem("unit") == "0") localStorage.setItem("unit", "kn")
  if (localStorage.getItem("unit") == "1") localStorage.setItem("unit", "m/s")
  if (localStorage.getItem("unit") == "2") localStorage.setItem("unit", "km/h")
  if (localStorage.getItem("unit") == "3") localStorage.setItem("unit", "mph")
  if (localStorage.getItem("unit") == "4") localStorage.setItem("unit", "Bft")

  if (localStorage.getItem("tableSort") == "0") localStorage.setItem("tableSort", "ascending")
  if (localStorage.getItem("tableSort") == "1") localStorage.setItem("tableSort", "descending")

  if (localStorage.getItem("tiles") == "0") localStorage.setItem("tiles", "OpenStreetMap")
  if (localStorage.getItem("tiles") == "1") localStorage.setItem("tiles", "Mapbox")

  if (localStorage.getItem("firstVisit") == "0") localStorage.setItem("hadFirstVisit", "0")
  if (localStorage.getItem("firstVisit") == "1") localStorage.setItem("hadFirstVisit", "1")
  localStorage.removeItem("firstVisit")

  if (localStorage.getItem("tiles") == "Mapbox") localStorage.setItem("tiles", "Mapbox custom")

  //v3.3.0
  if (localStorage.getItem("updatedTiles") !== "updated") {
    localStorage.setItem("tiles", "auto")
    localStorage.setItem("updatedTiles", "updated")
  }

  //v3.5.0
  const hiddenDatasets = JSON.parse(localStorage.getItem("hiddenDatasets"))
  if (hiddenDatasets["Windsterkte voorspelling"] != undefined) {
    hiddenDatasets["Windsterkte verwachting"] = hiddenDatasets["Windsterkte voorspelling"]
    hiddenDatasets["Windvlagen verwachting"] = hiddenDatasets["Windvlagen voorspelling"]
    hiddenDatasets["Windrichting verwachting"] = hiddenDatasets["Windrichting voorspelling"]

    delete hiddenDatasets["Windsterkte voorspelling"]
    delete hiddenDatasets["Windvlagen voorspelling"]
    delete hiddenDatasets["Windrichting voorspelling"]

    localStorage.setItem("hiddenDatasets", JSON.stringify(hiddenDatasets))
  }
}

//Functions to be executed when one of the global settings change

export function changeTheme(newValue) {
  localStorage.setItem("theme", newValue)

  if (localStorage.getItem("theme") == "auto") {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.body.classList.add("dark")
    } else
      document.body.classList.remove("dark")
  } else if (localStorage.getItem("theme") == "dark") {
    document.body.classList.add("dark")
  } else if (localStorage.getItem("theme") == "light") {
    document.body.classList.remove("dark")
  }

  if (location.pathname == "/") location.reload()
  if (location.pathname.substring(1, 5) == "wind" && localStorage.getItem("dataForm") == "graphs") {
    updateCurrentWind(true)
    updateGraphs()
  }
}

export function changeShowBar(showBarSelector) {
  let value
  const tabs = [document.querySelector("[data-overviewForm]"), document.querySelector("[data-dataForm]")].filter(x => x !== null)[0]
  if (showBarSelector.checked == false) {
    value = "0"
    tabs.style.display = "none"
  } else {
    value = "1"
    tabs.style.display = "block"
  }

  localStorage.setItem("showBar", value)
}

export function changeUnit(unitSelector, decimalsSelector) {
  localStorage.setItem("unit", unitSelector.value)
  globalThis.unit = unitSelector.value
  if (unitSelector.value == "Bft") {
    decimalsSelector.setAttribute("disabled", "disabled")
    globalThis.decimals = 0
  } else {
    globalThis.decimals = localStorage.getItem("decimals")
    decimalsSelector.removeAttribute("disabled")
  }
}

export function changeDecimals(decimalsSelector) {
  localStorage.setItem("decimals", decimalsSelector.value)
  globalThis.decimals = decimalsSelector.value
}

export function addUIListeners() {
  document.querySelector("[data-about]").addEventListener("click", () => displayPopUpWithName("over"))
  document.querySelector("[data-disclaimer]").addEventListener("click", () => displayPopUpWithName("disclaimer"))
  document.querySelector("[data-feedback]").addEventListener("click", () => displayPopUpFeedback())
  document.querySelector("[data-credit]").addEventListener("click", () => displayPopUpWithName("credit"))
  document.querySelector("[data-contact]").addEventListener("click", () => displayPopUpWithName("contact"))
}