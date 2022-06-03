import { displayPopUpWithName } from "./jsPopUps/functions.js"
import { updateGraphs } from "./wind/js/graphOrTableUpdate.js"

export function redirect() {
  if (window.location.host == "dewindnu.herokuapp.com") window.location.replace(`https://dewindnu.nl${window.location.pathname}`)
  if (["over", "feedback", "credit", "contact", "disclaimer"].includes(location.hash.substring(1)))
    displayPopUpWithName(location.hash.substring(1))
}

export function updateLocalVariables() {
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
}

export function setThemeSelector() {
  document.querySelector("[data-theme]").value = localStorage.getItem("theme")
}

export function changeTheme(newValue) {
  localStorage.setItem("theme", newValue)

  if (localStorage.getItem("theme") == "auto") {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.body.classList.add("dark")
      localStorage.setItem("tiles", "Mapbox donker")
    }
  } else if (localStorage.getItem("theme") == "dark") {
    document.body.classList.add("dark")
    localStorage.setItem("tiles", "Mapbox donker")
  } else if (localStorage.getItem("theme") == "light") {
    document.body.classList.remove("dark")
    if (localStorage.getItem("tiles") == "Mapbox donker") localStorage.setItem("tiles", "OpenStreetMap")
  }

  if (location.pathname == "/") location.reload()
  if (location.pathname.substring(1, 5) == "wind") updateGraphs()
}