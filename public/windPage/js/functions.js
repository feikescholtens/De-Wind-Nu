import { drawUpdateChart } from "./drawUpdateChart.js"

export function changeUnit(unitSelector, decimalsSelector) {
  localStorage.setItem("unit", unitSelector.value)
  if (unitSelector.value == 4) {
    decimalsSelector.setAttribute("disabled", "disabled")
    globalThis.decimals = 0
  } else decimalsSelector.removeAttribute("disabled")
  drawUpdateChart();
}

export function changeDecimals(decimalsSelector) {
  localStorage.setItem("decimals", decimalsSelector.value);
  drawUpdateChart();
}

export function unHideElements() {
  document.getElementsByTagName("header")[0].style.visibility = "visible"
  document.getElementsByTagName("main")[0].style.visibility = "visible"
  document.getElementsByTagName("footer")[0].style.visibility = "visible"

  document.getElementById("loader").style.display = "none";
}