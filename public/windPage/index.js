import { addDays, isToday, parse, format, parseISO, startOfDay } from "https://esm.run/date-fns"
import { contentUpdate } from "./js/contentUpdate.js"
import { changeDataForm, formulateErrorMessage, showErrorMessage, hideErrorMessage, hideMain, showLoader, hideLoader, setNewNumber, showMain, showCurrentWindBox, hideCurrentWindBox, changeInterpolation, calcInterpolation, changeTableSort, getAbsoluteDate, getRelativeDate, getDatePickerMax, switchPreviousDay, switchNextDay, setDateInUrl, checkWrapFlexNavBar } from "./js/functions.js"
import { redirect, updateLocalVariables, changeTheme, changeShowBar, changeUnit, units, setGeneralSettings, addUIListeners, changeDecimals } from "../globalFunctions.js"
redirect()
updateLocalVariables()
// if (isIOS()) document.getElementById("settings").style.width = document.body.clientWidth - 40 + "px"

Object.prototype.copy = function() { return JSON.parse(JSON.stringify(this)) }

//Immediately start retrieving the data
const locationID = location.pathname.substring(6, 10)

const dateURLString = new URLSearchParams(window.location.search).get("datum")
let dateURL, relativeDate, dateISO
try {
  dateURL = parse(dateURLString, "dd-MM-yyyy", new Date())
  relativeDate = getRelativeDate(dateURL)
  dateISO = startOfDay(dateURL).toISOString()
} catch {
  dateURL = null
  relativeDate = "Vandaag"
  dateISO = startOfDay(getAbsoluteDate(relativeDate)).toISOString()
  history.replaceState(null, null, `${window.location.origin + window.location.pathname}`)
}
document.querySelector("[data-currentDay]").innerText = relativeDate
if (dateURL !== null) document.querySelector("[data-datePicker]").value = format(dateURL, "yyyy-MM-dd")
fetchData(dateISO)

function fetchData(date) {
  const changeNumbersLoadingSymbolInterval = setInterval(() => setNewNumber(), 80)
  showLoader()
  hideErrorMessage()
  hideMain()

  fetch(`/getData/${locationID}?date=${date}`)
    .then(async response => {
      clearInterval(changeNumbersLoadingSymbolInterval)
      hideLoader()

      if (response.status !== 200) {
        document.querySelector("[data-errorFetching]").innerText = `Data ophalen van server mislukt met status code ${response.status}!`
        showErrorMessage()
      } else processRetrievedData(await response.json())
    })
}

//These need to be global because of other .js files!
globalThis.data = {},
  globalThis.dataWUnits = {},
  globalThis.date,
  globalThis.unit = localStorage.getItem("unit"),
  globalThis.decimals, //Is set in setGeneralSettings function
  globalThis.interpolation = localStorage.getItem("interpolation"),
  globalThis.times,
  globalThis.currentWindBoxSize = 350,
  globalThis.units = units,
  globalThis.overflowWidth = 0

//Selectors for general settings
const themeSelector = document.querySelector("[data-theme]"),
  showBarSelector = document.querySelector("[data-showBar]"),
  unitSelector = document.querySelector("[data-unit]"),
  decimalsSelector = document.querySelector("[data-decimals]")

//Selectors for windpage specific settings
const dataFormSelector = document.querySelector("[data-dataFormUnderSettings]"),
  interpolationSelector = document.querySelector("[data-interpolation]")

//Elements for settings the measurement location, measurement source, and forecast info
const locationLabelNode = document.querySelector("[data-location]"),
  measurementSourceLabelNode = document.querySelector("[data-measurementSource]"),
  forecastSourceLabelNode = document.querySelector("[data-forecastSource]")

//Other elemements
const compassCanvas = document.querySelector("[data-compass]"),
  currentWindBox = document.querySelector("[data-currentWindBox]"),
  headingChartWindspeed = document.querySelector("[data-headingChartWindspeed]"),
  headingTable = document.querySelector("[data-headingtabel]"),
  tableSort = document.querySelector("[data-timeHeading]")

//Sets the options in the settingstable and table with the data (sorting arrow) for the ones in local storage
//General settings
setGeneralSettings()
//Windpage specific settings
dataFormSelector.value = localStorage.getItem("dataForm")
if (localStorage.getItem("dataForm") == "table") { //This is done here (instead of in the index.ejs of the homepage) since it isn't displayed after all the data is processed
  document.querySelector("[data-graphs]").classList.remove("active")
  document.querySelector("[data-table]").classList.add("active")
  document.querySelector(".tabIndicator").style.left = `calc(1 * 120px + 5px)`
}
if (localStorage.getItem("interpolation") == "1") interpolationSelector.checked = true
if (localStorage.getItem("tableSort") == "ascending") tableSort.innerHTML = `Tijd <span id="sortArrow">▼</span>`

//Adding "dynamic" styles
locationLabelNode.style.right = (document.body.clientWidth - document.getElementsByTagName("main")[0].clientWidth) / 2 + "px"
window.addEventListener("resize", () => locationLabelNode.style.right = (document.body.clientWidth - document.getElementsByTagName("main")[0].clientWidth) / 2 + "px")
//Canvas
window.onresize = () => {
  compassCanvas.style.height = compassCanvas.clientWidth
  currentWindBox.style.width = currentWindBox.style.height = (compassCanvas.clientWidth * (200 / currentWindBoxSize)) / Math.sqrt(2) + "px"
  currentWindBox.style.marginTop = -(175 / currentWindBoxSize) * compassCanvas.clientWidth + "px"
}

//Add listeners for changing dates / requesting data
document.querySelector("[data-previousDay]").addEventListener("click", switchPreviousDay)
document.querySelector("[data-nextDay]").addEventListener("click", switchNextDay)
document.querySelector("[data-currentDay]").addEventListener("click", () => document.querySelector("[data-datePicker]").showPicker())
document.querySelector("[data-datePicker]").addEventListener("change", (e) => {
  const dateSelected = parse(e.target.value, "yyyy-MM-dd", new Date())
  const relativeDate = getRelativeDate(dateSelected)

  document.querySelector("[data-currentDay]").innerText = relativeDate
  setDateInUrl(dateSelected)

  fetchData(startOfDay(dateSelected).toISOString())
})
document.querySelector("[data-getData]").addEventListener("click", () => {
  const dateFetchString = document.querySelector("[data-currentDay]").innerText
  const dateFetch = getAbsoluteDate(dateFetchString)

  fetchData(startOfDay(dateFetch).toISOString())
})

//Listener functions for when settings are changed
//General settings
themeSelector.onchange = () => changeTheme(document.querySelector("[data-theme]").value)
showBarSelector.onchange = () => changeShowBar(showBarSelector)
unitSelector.onchange = () => {
  changeUnit(unitSelector, decimalsSelector)
  contentUpdate()
}
decimalsSelector.onchange = () => {
  changeDecimals(decimalsSelector)
  contentUpdate()
}
//Windpage specific settings
dataFormSelector.onchange = () => changeDataForm(dataFormSelector)
document.querySelector("[data-graphs]").addEventListener("click", (e) => changeDataForm(dataFormSelector, e)) //in the select bar
document.querySelector("[data-table]").addEventListener("click", (e) => changeDataForm(dataFormSelector, e)) //in the select bar
interpolationSelector.onchange = () => changeInterpolation(interpolationSelector)
tableSort.addEventListener("click", () => changeTableSort(tableSort))

addUIListeners()
checkWrapFlexNavBar(true)
window.onresize = checkWrapFlexNavBar

//Listener for logo and title
document.querySelectorAll("[data-gobackhome]").forEach(element => element.addEventListener("click", () => { //Somehow the camelcased "data-goBackHome" won't work on Safari
  if (document.referrer) {
    const url = new URL(document.referrer);
    if (["localhost", "dewindnu.nl", "www.dewindnu.nl", "192.168.2.6", "de-wind-nu-test.ew.r.appspot.com"].includes(url.hostname)) {
      if (url.pathname == "/") history.go(-1)
    }
  } else {
    window.location.replace(window.location.origin)
  }
}))









//Processing the data that comes in, scope / place in which file cannot be changed
async function processRetrievedData(dataFetched) {
  if (dataFetched.errorCode) {
    const errorMessage = await formulateErrorMessage(dataFetched)
    document.querySelector("[data-errorFetching]").innerText = errorMessage
    document.querySelector("[data-errorFetching]").classList.remove("noDisplay")
    return
  }

  showMain()

  const dataset = dataFetched.dataset
  const dateData = parseISO(dataFetched.date)
  globalThis.times = dataFetched.values.times
  globalThis.date = getRelativeDate(dateData),
    globalThis.dateTomorrow = getRelativeDate(addDays(dateData, 1)),
    globalThis.interpolatedData = {}, globalThis.interpolatedIndices = {}

  data = dataFetched.values
  dataWUnits = data.copy();
  ({ interpolatedData, interpolatedIndices } = calcInterpolation())

  if (dataset == "MVB") measurementSourceLabelNode.innerText = "Meetnet Vlaamse Banken"
  else if (dataset == "VLINDER") measurementSourceLabelNode.innerText = "UGent VLINDER project"
  else measurementSourceLabelNode.innerText = dataset

  forecastSourceLabelNode.innerText = dataFetched.forecastInfoString
  globalThis.datePickerMax = getDatePickerMax()
  document.querySelector("[data-datePicker]").setAttribute("max", format(globalThis.datePickerMax, "yyyy-MM-dd"))

  //Remove current wind box if no mearurements are available OR date is not of the current day and set headings
  if ((dataWUnits.windSpeed.length == 0 && dataWUnits.windGusts.length == 0 && dataWUnits.windDirection.length == 0) || !isToday(dateData)) hideCurrentWindBox()
  else showCurrentWindBox()
  const NoMeasurementTypesAvailable = [dataWUnits.windSpeed.length !== 0, dataWUnits.windGusts.length !== 0, dataWUnits.windDirection.length !== 0].filter(array => array !== false).length;
  if (dataWUnits.windGusts.length !== 0 || dataWUnits.windSpeedForecast) headingChartWindspeed.innerText = "Windsterkte en -vlagen"
  if (NoMeasurementTypesAvailable == 3 || dataWUnits.windSpeedForecast) headingTable.innerText = "Windsterkte, -vlagen en -richting"
  else if (NoMeasurementTypesAvailable !== 3 && !dataWUnits.windSpeedForecast) headingTable.innerText = "Windsterkte, en -richting"

  //For both graphs and table
  contentUpdate()
}