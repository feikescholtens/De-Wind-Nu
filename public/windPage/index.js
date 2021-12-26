import { contact } from "../jsPopUps/contact.js"
import { credit } from "../jsPopUps/credit.js"
import { feedback } from "../jsPopUps/feedback.js"
import { drawUpdateChart } from "./js/drawUpdateChart.js"
import { changeUnit, changeDecimals, unHideElements } from "./js/functions.js"

//These need to be global because of other .js files!
globalThis.data = [],
  globalThis.data_unit = [],
  globalThis.unit, globalThis.decimals,
  globalThis.times, globalThis.units, globalThis.currentWindBoxSize = 350;

(async () => {
  globalThis.times = await fetch("json/chartTimes.json").then(response => response.json())
  globalThis.units = await fetch("json/units.json").then(response => response.json())

  const dataset = dataFetched.dataset,
    spotName = dataFetched.spotName
  const unitSelector = document.getElementById("eenheid"),
    decimalsSelector = document.getElementById("decimals")
  const subtitleNode = document.getElementById("subtitle"),
    compassCanvas = document.getElementById("wind_compass"),
    currentWindBox = document.getElementById("actuele_gegevens")

  //Setting local storage variables if never set before
  if (!localStorage.getItem("unit")) localStorage.setItem("unit", 0)
  if (!localStorage.getItem("decimals")) localStorage.setItem("decimals", 1)

  //Sets the options in the settingstable for the ones in local storage
  unitSelector.value = localStorage.getItem("unit")
  if (unitSelector.value == 4) decimalsSelector.setAttribute("disabled", "disabled")
  decimalsSelector.value = localStorage.getItem("decimals")

  //(1)Change the data in local storage when other options are selected and (2) refresh the graphs
  unitSelector.onchange = () => changeUnit(unitSelector, decimalsSelector)
  decimalsSelector.onchange = () => changeDecimals(decimalsSelector)

  data = dataFetched.values;
  data_unit = JSON.parse(JSON.stringify(dataFetched.values));

  //Data is now loaded, so the content get can displayed and the loading symbol removed
  document.title = "De Wind Nu: " + spotName;
  if (dataset == "Rijkswaterstaat") subtitleNode.innerHTML = spotName + "<br><span class='small'>Rijkswaterstaat & ECMWF</span"
  else if (dataset == "KNMI") subtitleNode.innerHTML = spotName + "<br><span class='small'>KNMI</span>";
  else if (dataset == "MVB") {
    subtitleNode.innerHTML = spotName + "<br><span class='small'>Meetnet Vlaamse Banken</span>";
    document.getElementById("decimals").getElementsByTagName("option")[2].innerHTML = 2;
  }
  unHideElements()

  //Make the canvas of the current wind section dynamic (1: initially, 2: onwindowchange)
  //(1)
  compassCanvas.style.width = "100%";
  compassCanvas.style.height = compassCanvas.clientWidth;
  //(2)
  window.onresize = () => {
    compassCanvas.style.height = compassCanvas.clientWidth;
    currentWindBox.style.width = currentWindBox.style.height = (compassCanvas.clientWidth * (200 / currentWindBoxSize)) / Math.sqrt(2) + "px";
    currentWindBox.style.marginTop = -(175 / currentWindBoxSize) * compassCanvas.clientWidth + "px";
  };
  compassCanvas.style.height = compassCanvas.clientWidth;
  currentWindBox.style.width = currentWindBox.style.height = (compassCanvas.clientWidth * (200 / currentWindBoxSize)) / Math.sqrt(2) + "px";
  currentWindBox.style.marginTop = -(175 / currentWindBoxSize) * compassCanvas.clientWidth + "px";

  drawUpdateChart();
})();

document.getElementById("contact").addEventListener("click", contact)
document.getElementById("credit").addEventListener("click", credit)
document.getElementById("feedback").addEventListener("click", feedback)