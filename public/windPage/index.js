import { displayPopUpWithName } from "../jsPopUps/functions.js"
import { displayPopUpFeedback } from "../jsPopUps/feedback.js"
import { contentUpdate } from "./js/contentUpdate.js"
import { changeShowBar, changeDataForm, changeUnit, changeDecimals, unHideElements, changeInterpolation, calcInterpolation, changeTableSort } from "./js/functions.js"
import { redirect, updateLocalVariables } from "../globalFunctions.js"
redirect()
updateLocalVariables()

Object.prototype.copy = function() { return JSON.parse(JSON.stringify(this)) }
const changeNumbersLoadingSymbolInterval = setInterval(() => setNewNumber(), 80)

//Immediately start retrieving the data
const locationID = location.pathname.substring(6, 10)
fetch(`/getData/${locationID}`)
  .then(async response => {
    if (response.status !== 200) {
      window.location.replace(`${location.origin}/fout/${response.status}`)
      return
    }
    processRetrievedData(await response.json())
    clearInterval(changeNumbersLoadingSymbolInterval)

  })

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
//Canvas (1: initially, 2: onwindowchange)
//(1)
compassCanvas.style.width = "100%"
compassCanvas.style.height = compassCanvas.clientWidth
//(2)
window.onresize = () => {
  compassCanvas.style.height = compassCanvas.clientWidth
  currentWindBox.style.width = currentWindBox.style.height = (compassCanvas.clientWidth * (200 / currentWindBoxSize)) / Math.sqrt(2) + "px"
  currentWindBox.style.marginTop = -(175 / currentWindBoxSize) * compassCanvas.clientWidth + "px"
}
compassCanvas.style.height = compassCanvas.clientWidth
currentWindBox.style.width = currentWindBox.style.height = (compassCanvas.clientWidth * (200 / currentWindBoxSize)) / Math.sqrt(2) + "px"
currentWindBox.style.marginTop = -(175 / currentWindBoxSize) * compassCanvas.clientWidth + "px"

//Processing the data that comes in
async function processRetrievedData(dataFetched) {
  if (dataFetched.errorCode) window.location.replace(`${window.location.origin}/fout/${dataFetched.errorCode}`)

  const dataset = dataFetched.dataset,
    spotName = dataFetched.spotName

  globalThis.times = dataFetched.values.times
  globalThis.interpolatedData = {}, globalThis.interpolatedIndices = {}

  data = dataFetched.values
  dataWUnits = data.copy();
  ({ interpolatedData, interpolatedIndices } = calcInterpolation())

  document.title = "De Wind Nu: " + spotName
  locationLabelNode.innerText = spotName

  measurementSourceLabelNode.innerText = dataset
  if (dataset == "MVB") measurementSourceLabelNode.innerText = "Meetnet Vlaamse Banken"
  if (dataset == "VLINDER") measurementSourceLabelNode.innerText = "UGent VLINDER project"
  if (dataset == "KNMI" || dataset == "VLINDER")
    document.querySelector("[data-decimals]").getElementsByTagName("option")[2].innerText = "2 (metingen slechts geleverd in één decimaal)"

  if (dataFetched.forecastRun == "N.A.") forecastSourceLabelNode.innerText = "niet beschikbaar"
  forecastRunLabelNode.innerText = dataFetched.forecastRun
  nextForecastRunLabelNode.innerText = dataFetched.nextForecastRun

  //Remove current wind box if no mearurements are available and set headings
  if (dataWUnits.windSpeed.length == 0 && dataWUnits.windGusts.length == 0 && dataWUnits.windDirection.length == 0) {
    document.querySelector("[data-headingcurrentwind]").classList.add("hidden")
    document.querySelector("[data-currentwindbox]").classList.add("hidden")
    document.querySelector("[data-compass]").classList.add("hidden")
  }
  const NoMeasurementTypesAvailable = [dataWUnits.windSpeed.length !== 0, dataWUnits.windGusts.length !== 0, dataWUnits.windDirection.length !== 0].filter(array => array !== false).length;
  if (dataWUnits.windGusts.length !== 0 || dataWUnits.windSpeedForecast) headingChartWindspeed.innerText = "Windsterkte en -vlagen"
  if (NoMeasurementTypesAvailable == 3 || dataWUnits.windSpeedForecast) headingTable.innerText = "Windsterkte, -vlagen en -richting"
  else if (NoMeasurementTypesAvailable !== 3 && !dataWUnits.windSpeedForecast) headingTable.innerText = "Windsterkte, en -richting"

  //For both graphs and table
  unHideElements()
  contentUpdate()
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