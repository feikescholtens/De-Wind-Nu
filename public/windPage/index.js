import { addDays, subDays, differenceInCalendarDays, isYesterday, isToday, isTomorrow, parse, format } from "https://esm.run/date-fns"
import nl from "https://esm.run/date-fns/locale/nl"
import { displayPopUpWithName } from "../jsPopUps/functions.js"
import { displayPopUpFeedback } from "../jsPopUps/feedback.js"
import { contentUpdate } from "./js/contentUpdate.js"
import { changeShowBar, changeDataForm, changeUnit, changeDecimals, formulateErrorMessage, showErrorMessage, hideErrorMessage, hideMain, showLoader, hideLoader, showMain, showCurrentWindBox, hideCurrentWindBox, changeInterpolation, calcInterpolation, changeTableSort } from "./js/functions.js"
import { redirect, updateLocalVariables } from "../globalFunctions.js"
redirect()
updateLocalVariables()

Object.prototype.copy = function() { return JSON.parse(JSON.stringify(this)) }

//Immediately start retrieving the data
const locationID = location.pathname.substring(6, 10)

const dateURLString = new URLSearchParams(window.location.search).get("datum")
let absoluteDate, relativeDate
try {
  const dateURL = parse(dateURLString, "dd-MM-yyyy", new Date())
  relativeDate = getRelativeDate(dateURL)
  absoluteDate = dateURLString
} catch {
  relativeDate = "Vandaag"
  absoluteDate = format(getAbsoluteDate(relativeDate), "dd-MM-yyyy")

  history.replaceState(null, null, `${window.location.origin + window.location.pathname}`)
}
document.querySelector("[data-currentDay]").innerText = relativeDate
console.log("Date to fetch initially: ", absoluteDate)

fetchData(absoluteDate)

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
  globalThis.unit, globalThis.decimals, globalThis.interpolation,
  globalThis.times, globalThis.currentWindBoxSize = 350,
  globalThis.units = await fetch("json/units.json").then(response => response.json())

function setNewNumber() {
  const latestNumber = document.getElementsByClassName("marker")[0].innerText
  const newNumber = parseInt(String(Math.random())[2])

  if (latestNumber !== newNumber) {
    document.getElementsByClassName("marker")[0].innerText = parseInt(String(Math.random())[2])
  } else {
    setNewNumber()
  }
}

const showBarSelector = document.querySelector("[data-showBar]"),
  dataFormSelector = document.querySelector("[data-dataFormUnderSettings]"),
  unitSelector = document.querySelector("[data-unit]"),
  decimalsSelector = document.querySelector("[data-decimals]"),
  interpolationSelector = document.querySelector("[data-interpolation]")

const locationLabelNode = document.querySelector("[data-location]"),
  measurementSourceLabelNode = document.querySelector("[data-measurementSource]"),
  forecastSourceLabelNode = document.querySelector("[data-forecastSource]"),
  forecastRunLabelNode = document.querySelector("[data-forecastRun]"),
  nextForecastRunLabelNode = document.querySelector("[data-nextForecastRun]")

const compassCanvas = document.querySelector("[data-compass]"),
  currentWindBox = document.querySelector("[data-currentWindBox]"),
  headingChartWindspeed = document.querySelector("[data-headingChartWindspeed]"),
  headingTable = document.querySelector("[data-headingtabel]"),
  tableSort = document.querySelector("[data-timeHeading]")

//Setting local storage variables if never set before
if (!localStorage.getItem("showBar")) localStorage.setItem("showBar", 1)
if (!localStorage.getItem("dataForm")) localStorage.setItem("dataForm", "graphs")
if (!localStorage.getItem("unit")) localStorage.setItem("unit", "kn")
if (!localStorage.getItem("decimals")) localStorage.setItem("decimals", 1)
if (!localStorage.getItem("interpolation")) localStorage.setItem("interpolation", 0)
if (!localStorage.getItem("tableSort")) localStorage.setItem("tableSort", "descending")

//Sets the options in the settingstable for the ones in local storage
if (localStorage.getItem("showBar") == "1") showBarSelector.checked = true
else document.querySelector("[data-dataForm]").style.display = "none"

dataFormSelector.value = localStorage.getItem("dataForm")
if (localStorage.getItem("dataForm") == "table") {
  document.querySelector("[data-graphs]").classList.add("deselected")
  document.querySelector("[data-tabel]").classList.remove("deselected")
}

unitSelector.value = localStorage.getItem("unit")
if (unitSelector.value == 4) decimalsSelector.setAttribute("disabled", "disabled")
decimalsSelector.value = localStorage.getItem("decimals")
interpolationSelector.value = localStorage.getItem("interpolation")
if (localStorage.getItem("tableSort") == "ascending") tableSort.innerHTML = `Tijd <span id="sortArrow">▼</span>`

//Links for going back to homepage
document.querySelectorAll("[data-goBackHome]").forEach(element => element.addEventListener("click", () => {
  if (document.referrer !== "") {
    window.location.replace(document.referrer)
  } else {
    window.location.replace("/")
  }
}))

//Adding "dynamic" styles
locationLabelNode.style.right = (document.body.clientWidth - document.getElementsByTagName("main")[0].clientWidth) / 2 + "px"
window.addEventListener("resize", () => locationLabelNode.style.right = (document.body.clientWidth - document.getElementsByTagName("main")[0].clientWidth) / 2 + "px")
//Canvas
window.onresize = () => {
  compassCanvas.style.height = compassCanvas.clientWidth
  currentWindBox.style.width = currentWindBox.style.height = (compassCanvas.clientWidth * (200 / currentWindBoxSize)) / Math.sqrt(2) + "px"
  currentWindBox.style.marginTop = -(175 / currentWindBoxSize) * compassCanvas.clientWidth + "px"
}

//Processing the data that comes in
async function processRetrievedData(dataFetched) {
  if (dataFetched.errorCode) {
    const errorMessage = await formulateErrorMessage(dataFetched)
    document.querySelector("[data-errorFetching]").innerText = errorMessage
    document.querySelector("[data-errorFetching]").classList.remove("noDisplay")
    return
  }

  showMain()

  const dataset = dataFetched.dataset
  const dateData = parse(dataFetched.date, "dd-MM-yyyy", new Date())
  globalThis.times = dataFetched.values.times
  globalThis.interpolatedData = {}, globalThis.interpolatedIndices = {}

  data = dataFetched.values
  dataWUnits = data.copy();
  ({ interpolatedData, interpolatedIndices } = calcInterpolation())

  measurementSourceLabelNode.innerText = dataset
  if (dataset == "MVB") measurementSourceLabelNode.innerText = "Meetnet Vlaamse Banken"
  if (dataset == "VLINDER") measurementSourceLabelNode.innerText = "UGent VLINDER project"
  if (dataset == "KNMI" || dataset == "VLINDER")
    document.querySelector("[data-decimals]").getElementsByTagName("option")[2].innerHTML = "2 (needs fixing...)"

  if (dataFetched.forecastRun == "N.A.") forecastSourceLabelNode.innerText = "niet beschikbaar"
  forecastRunLabelNode.innerText = dataFetched.forecastRun
  nextForecastRunLabelNode.innerText = dataFetched.nextForecastRun

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

//Add listeners for changing dates
document.querySelector("[data-previousDay]").addEventListener("click", () => {
  const currentDate = document.querySelector("[data-currentDay]").innerText
  const absoluteDate = getAbsoluteDate(currentDate)

  const previousDay = subDays(absoluteDate, 1)
  const relativePreviousDay = getRelativeDate(previousDay)

  document.querySelector("[data-currentDay]").innerText = relativePreviousDay
  setDateInUrl(previousDay)
})

document.querySelector("[data-nextDay]").addEventListener("click", () => {
  const currentDate = document.querySelector("[data-currentDay]").innerText
  const absoluteDate = getAbsoluteDate(currentDate)

  const nextDay = addDays(absoluteDate, 1)
  const relativeNextDay = getRelativeDate(nextDay)

  document.querySelector("[data-currentDay]").innerText = relativeNextDay
  setDateInUrl(nextDay)
})

document.querySelector("[data-currentDay]").addEventListener("click", () =>
  document.querySelector("[data-datePicker]").showPicker()
)
document.querySelector("[data-datePicker]").addEventListener("change", (e) => {
  const dateSelected = parse(e.target.value, "yyyy-MM-dd", new Date())
  const relativeDate = getRelativeDate(dateSelected)

  document.querySelector("[data-currentDay]").innerText = relativeDate
  setDateInUrl(dateSelected)
})
document.querySelector("[data-getData]").addEventListener("click", () => {
  const dateFetchString = document.querySelector("[data-currentDay]").innerText
  const dateFetch = getAbsoluteDate(dateFetchString)
  const dateFetchAbsolute = format(dateFetch, "dd-MM-yyyy")

  fetchData(dateFetchAbsolute)
})

function getAbsoluteDate(date) {
  if (date == "Eergisteren") return subDays(new Date(), 2)
  else if (date == "Gisteren") return subDays(new Date(), 1)
  else if (date == "Vandaag") return new Date()
  else if (date == "Morgen") return addDays(new Date(), 1)
  else if (date == "Overmorgen") return addDays(new Date(), 2)
  else return parse(date.substring(4), "d MMM yyyy", new Date(), { locale: nl })
}

function getRelativeDate(date) {
  if (differenceInCalendarDays(date, new Date()) == -2) return "Eergisteren"
  else if (isYesterday(date)) return "Gisteren"
  else if (isToday(date)) return "Vandaag"
  else if (isTomorrow(date)) return "Morgen"
  else if (differenceInCalendarDays(date, new Date()) == 2) return "Overmorgen"
  else return format(date, "eeeeee. d MMM yyyy", { locale: nl })
}

function setDateInUrl(date) {
  if (isToday(date)) {
    history.replaceState(null, null, `${window.location.origin + window.location.pathname}`)
    return
  }

  const dateString = format(date, "dd-MM-yyyy")
  history.replaceState(null, null, `?datum=${dateString}`)
}

//(1)Change the data in local storage when other options are selected and (2) refresh the graphs
showBarSelector.onchange = () => changeShowBar(showBarSelector)
dataFormSelector.onchange = () => changeDataForm(dataFormSelector)
document.querySelector("[data-graphs]").addEventListener("click", (e) => changeDataForm(dataFormSelector, e))
document.querySelector("[data-tabel]").addEventListener("click", (e) => changeDataForm(dataFormSelector, e))
unitSelector.onchange = () => changeUnit(unitSelector, decimalsSelector)
decimalsSelector.onchange = () => changeDecimals(decimalsSelector)
interpolationSelector.onchange = () => changeInterpolation(interpolationSelector)
tableSort.addEventListener("click", () => changeTableSort(tableSort))

//Footer links
document.querySelector("[data-about]").addEventListener("click", () => displayPopUpWithName("over"))
document.querySelector("[data-disclaimer]").addEventListener("click", () => displayPopUpWithName("disclaimer"))
document.querySelector("[data-feedback]").addEventListener("click", () => displayPopUpFeedback())
document.querySelector("[data-credit]").addEventListener("click", () => displayPopUpWithName("credit"))
document.querySelector("[data-contact]").addEventListener("click", () => displayPopUpWithName("contact"))