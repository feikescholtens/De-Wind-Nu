import { displayPopUpWithName } from "../jsPopUps/functions.js"
import { displayPopUpFeedback } from "../jsPopUps/feedback.js"
import { contentUpdate } from "./js/contentUpdate.js"
import { changeShowBar, changeDataForm, changeUnit, changeDecimals, unHideElements, changeInterpolation, calcInterpolation, changeTableSort } from "./js/functions.js"
import { redirect } from "../redirect.js"
redirect()

Array.prototype.copy = function() { return JSON.parse(JSON.stringify(this)) }

globalThis.reload = contentUpdate

//These need to be global because of other .js files!
globalThis.data = [],
  globalThis.data_unit = [],
  globalThis.unit, globalThis.decimals, globalThis.interpolation,
  globalThis.times, globalThis.units, globalThis.currentWindBoxSize = 350;

(async () => {

  globalThis.times = await fetch("json/chartTimes.json").then(response => response.json())
  globalThis.units = await fetch("json/units.json").then(response => response.json())

  const dataset = dataFetched.dataset,
    spotName = dataFetched.spotName
  const showBarSelector = document.querySelector("[data-showBar]"),
    dataFormSelector = document.querySelector("[data-dataFormUnderSettings]"),
    unitSelector = document.querySelector("[data-unit]"),
    decimalsSelector = document.querySelector("[data-decimals]"),
    interpolationSelector = document.querySelector("[data-interpolation]")

  const locationLabelNode = document.querySelector("[data-location]"),
    measurementSourceLabelNode = document.querySelector("[data-measurementSource]"),
    forecastRunLabelNode = document.querySelector("[data-forecastRun]"),
    nextForecastRunLabelNode = document.querySelector("[data-nextForecastRun]")

  const compassCanvas = document.querySelector("[data-compass]"),
    currentWindBox = document.querySelector("[data-currentWindBox]"),
    headingChartWindspeed = document.querySelector("[data-headingChartWindspeed]"),
    headingTable = document.querySelector("[data-headingtabel]"),
    tableSort = document.querySelector("[data-timeHeading]")

  //Setting local storage variables if never set before
  if (!localStorage.getItem("showBar")) localStorage.setItem("showBar", 1)
  if (!localStorage.getItem("dataForm")) localStorage.setItem("dataForm", 0)
  if (!localStorage.getItem("unit")) localStorage.setItem("unit", 0)
  if (!localStorage.getItem("decimals")) localStorage.setItem("decimals", 1)
  if (!localStorage.getItem("interpolation")) localStorage.setItem("interpolation", 0)
  if (!localStorage.getItem("tableSort")) localStorage.setItem("tableSort", 1)

  //Sets the options in the settingstable for the ones in local storage
  if (localStorage.getItem("showBar") == "1") showBarSelector.checked = true
  else document.querySelector("[data-dataForm]").style.display = "none"

  dataFormSelector.value = localStorage.getItem("dataForm")
  if (localStorage.getItem("dataForm") == "1") {
    document.querySelector("[data-graphs]").classList.add("deselected")
    document.querySelector("[data-tabel]").classList.remove("deselected")
  }

  unitSelector.value = localStorage.getItem("unit")
  if (unitSelector.value == 4) decimalsSelector.setAttribute("disabled", "disabled")
  decimalsSelector.value = localStorage.getItem("decimals")
  interpolationSelector.value = localStorage.getItem("interpolation")
  if (localStorage.getItem("tableSort") == "0") tableSort.innerHTML = `Tijd <span id="sortArrow">▼</span>`

  //(1)Change the data in local storage when other options are selected and (2) refresh the graphs
  showBarSelector.onchange = () => changeShowBar(showBarSelector)
  dataFormSelector.onchange = () => changeDataForm(dataFormSelector)
  document.querySelector("[data-graphs]").addEventListener("click", (e) => changeDataForm(dataFormSelector, e))
  document.querySelector("[data-tabel]").addEventListener("click", (e) => changeDataForm(dataFormSelector, e))
  unitSelector.onchange = () => changeUnit(unitSelector, decimalsSelector)
  decimalsSelector.onchange = () => changeDecimals(decimalsSelector)
  interpolationSelector.onchange = () => changeInterpolation(interpolationSelector)
  tableSort.addEventListener("click", () => changeTableSort(tableSort))

  data = dataFetched.values
  data_unit = data.copy()

  globalThis.interpolatedData = calcInterpolation()[0]
  globalThis.interpolatedIndices = calcInterpolation()[1]
  if (interpolation == "1") {
    for (let h = 2; h < 5; h++) {
      interpolatedData[h - 2].forEach((element) => {
        data[h][element.index] = element.value
      })
    }
  }

  //Data is now loaded, so the content get can displayed and the loading symbol removed
  document.querySelectorAll("[data-goBackHome]").forEach(element => element.addEventListener("click", () => {
    if (document.referrer !== "") {
      window.location.replace(document.referrer)
    } else {
      window.location.replace("/")
    }
  }))

  document.title = "De Wind Nu: " + spotName
  locationLabelNode.innerText = spotName
  locationLabelNode.style.right = (document.body.clientWidth - document.getElementsByTagName("main")[0].clientWidth) / 2 + "px"
  window.addEventListener("resize", () => locationLabelNode.style.right = (document.body.clientWidth - document.getElementsByTagName("main")[0].clientWidth) / 2 + "px")

  if (dataset == "Rijkswaterstaat") measurementSourceLabelNode.innerText = "Rijkswaterstaat"
  else if (dataset == "KNMI") {
    measurementSourceLabelNode.innerText = "KNMI"
    document.querySelector("[data-decimals]").getElementsByTagName("option")[2].innerText = "2 (metingen slechts geleverd in één decimaal)"
  } else if (dataset == "MVB") measurementSourceLabelNode.innerText = "Meetnet Vlaamse Banken"

  forecastRunLabelNode.innerText = dataFetched.forecastRun
  nextForecastRunLabelNode.innerText = dataFetched.nextForecastRun

  unHideElements()

  //Make the canvas of the current wind section dynamic (1: initially, 2: onwindowchange)
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

  //Remove current wind box if no mearurements are available and set headings
  if (data_unit[2].length == 0 && data_unit[3].length == 0 && data_unit[4].length == 0) {
    document.querySelector("[data-headingcurrentwind]").classList.add("hidden")
    document.querySelector("[data-currentwindbox]").classList.add("hidden")
    document.querySelector("[data-compass]").classList.add("hidden")
  }
  const NoMeasurementTypesAvailable = [data_unit[2].length !== 0, data_unit[3].length !== 0, data_unit[4].length !== 0].filter(array => array !== false).length;
  if (data_unit[3].length !== 0 || data_unit[5]) headingChartWindspeed.innerText = "Windsterkte en -vlagen"
  if (NoMeasurementTypesAvailable == 3 || data_unit[5]) headingTable.innerText = "Windsterkte, -vlagen en -richting"
  else if (NoMeasurementTypesAvailable !== 3 && !data_unit[5]) headingTable.innerText = "Windsterkte, en -richting"

  //For both graphs and table
  contentUpdate()
})()

document.querySelector("[data-about]").addEventListener("click", () => displayPopUpWithName("over"))
document.querySelector("[data-disclaimer]").addEventListener("click", () => displayPopUpWithName("disclaimer"))
document.querySelector("[data-feedback]").addEventListener("click", () => displayPopUpFeedback())
document.querySelector("[data-credit]").addEventListener("click", () => displayPopUpWithName("credit"))
document.querySelector("[data-contact]").addEventListener("click", () => displayPopUpWithName("contact"))