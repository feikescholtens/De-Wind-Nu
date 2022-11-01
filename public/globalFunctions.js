import { displayPopUpWithName } from "./jsPopUps/functions.js"
import { displayPopUpFeedback } from "./jsPopUps/feedback.js"
import { updateGraphs } from "./wind/js/graphOrTableUpdate.js"

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

  //Windpage specific settings
  if (!localStorage.getItem("dataForm")) localStorage.setItem("dataForm", "graphs")
  if (!localStorage.getItem("interpolation")) localStorage.setItem("interpolation", 0)
  if (!localStorage.getItem("tableSort")) localStorage.setItem("tableSort", "descending") //not under settings
  if (!localStorage.getItem("hiddenDatasets")) localStorage.setItem("hiddenDatasets", JSON.stringify({ //not under settings
    "Windsterkte": false,
    "Windvlagen": false,
    "Windrichting": false,
    "Windsterkte voorspelling": false,
    "Windvlagen voorspelling": false,
    "Windrichting voorspelling": false
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
}

//Functions to be executed when one of the global settings change

export function changeTheme(newValue) {
  localStorage.setItem("theme", newValue)

  if (localStorage.getItem("theme") == "auto") {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.body.classList.add("dark")
    }
  } else if (localStorage.getItem("theme") == "dark") {
    document.body.classList.add("dark")
  } else if (localStorage.getItem("theme") == "light") {
    document.body.classList.remove("dark")
  }

  if (location.pathname == "/") location.reload()
  if (location.pathname.substring(1, 5) == "wind" && localStorage.getItem("dataForm") == "graphs") updateGraphs()
}

export function changeShowBar(showBarSelector) {
  let value
  const textSelector = [document.querySelector("[data-overviewForm]"), document.querySelector("[data-dataForm]")].filter(x => x !== null)[0]
  if (showBarSelector.checked == false) {
    value = "0"
    textSelector.style.display = "none"
  } else {
    value = "1"
    textSelector.style.display = "block"
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