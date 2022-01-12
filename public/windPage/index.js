import { contact } from "../jsPopUps/contact.js"
import { credit } from "../jsPopUps/credit.js"
import { feedback } from "../jsPopUps/feedback.js"
import { contentUpdate } from "./js/contentUpdate.js"
import { changeShowBar, changeDataForm, changeUnit, changeDecimals, unHideElements, changeInterpolation, calcInterpolation, changeTableSort } from "./js/functions.js"

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

  const subtitleNode = document.querySelector("[data-subtitle]"),
    compassCanvas = document.querySelector("[data-compass]"),
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
  if (dataset == "Rijkswaterstaat") subtitleNode.innerHTML = spotName + "<br><span class='small'>Rijkswaterstaat</span"
  else if (dataset == "KNMI") {
    subtitleNode.innerHTML = spotName + "<br><span class='small'>KNMI</span>"
    document.querySelector("[data-decimals]").getElementsByTagName("option")[2].innerText = "2 (data slechts geleverd in één decimaal)"
  } else if (dataset == "MVB") subtitleNode.innerHTML = spotName + "<br><span class='small'>Meetnet Vlaamse Banken</span>"

  subtitleNode.style.right = (document.body.clientWidth - document.getElementsByTagName("main")[0].clientWidth) / 2 + "px"
  window.addEventListener("resize", () => subtitleNode.style.right = (document.body.clientWidth - document.getElementsByTagName("main")[0].clientWidth) / 2 + "px")

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

  //Set headers
  if (data_unit[3].length !== 0) {
    headingChartWindspeed.innerText = "Windsterkte en -vlagen"

    if (data_unit[4].length !== 0) headingTable.innerText = "Windsterkte, -vlagen en -richting"
    else headingTable.innerText = "Windsterkte en -vlagen"
  }

  //For both graphs and table
  contentUpdate()
})()

document.querySelector("[data-feedback]").addEventListener("click", feedback)
document.querySelector("[data-credit]").addEventListener("click", credit)
document.querySelector("[data-contact]").addEventListener("click", contact)