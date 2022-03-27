import { contentUpdate } from "./contentUpdate.js"

export function changeShowBar(showBarSelector) {
  let value
  if (showBarSelector.checked == false) {
    value = "0"
    document.querySelector("[data-dataForm]").style.display = "none"
  } else {
    value = "1"
    document.querySelector("[data-dataForm]").style.display = "block"
  }

  localStorage.setItem("showBar", value)
}

export function changeDataForm(dataFormSelector, e) {
  let clickedOption
  if (e) clickedOption = e.path[0].innerText

  //Check if the dataForm is changed at all
  if (clickedOption == "Grafieken" && localStorage.getItem("dataForm") == "0") return
  if (clickedOption == "Tabel" && localStorage.getItem("dataForm") == "1") return

  if (clickedOption == "Grafieken") dataFormSelector.value = "0"
  if (clickedOption == "Tabel") dataFormSelector.value = "1"

  document.querySelector("[data-graphs]").classList.toggle("deselected")
  document.querySelector("[data-tabel]").classList.toggle("deselected")
  localStorage.setItem("dataForm", dataFormSelector.value)

  contentUpdate()
}

export function changeUnit(unitSelector, decimalsSelector) {
  localStorage.setItem("unit", unitSelector.value)
  globalThis.unit = unitSelector.value
  if (unitSelector.value == 4) {
    decimalsSelector.setAttribute("disabled", "disabled")
    globalThis.decimals = 0
  } else decimalsSelector.removeAttribute("disabled")
  contentUpdate()
}

export function changeDecimals(decimalsSelector) {
  localStorage.setItem("decimals", decimalsSelector.value)
  contentUpdate()
}

export function changeInterpolation(interpolationSelector) {
  localStorage.setItem("interpolation", interpolationSelector.value)

  //Same as in index.js
  if (interpolation == "1") {
    for (let h = 2; h < 5; h++) {
      interpolatedData[h - 2].forEach((element) => {
        data_unit[h][element.index] = element.value
      })
    }
  }
  contentUpdate()
}

export function unHideElements() {
  document.getElementsByTagName("header")[0].style.visibility = "visible"
  document.getElementsByTagName("main")[0].style.visibility = "visible"
  document.getElementsByTagName("footer")[0].style.visibility = "visible"

  document.querySelector("[data-loader]").style.display = "none"
}

export function calcInterpolation() {

  let interpolatedData = JSON.parse(JSON.stringify(new Array(3).fill([]))),
    interpolatedIndices = JSON.parse(JSON.stringify(new Array(3).fill([])))

  for (let h = 2; h < 5; h++) {

    for (let i = 0; i < data[h].length; i++) {
      let j

      if (data[h][i] < 0) {
        for (j = i + 1; j < data[h].length; j++) {
          if (data[h][j] >= 0) break
        }

        const startIndex = i - 1,
          stopIndex = j

        for (let k = startIndex; k < stopIndex - 1; k++) {
          const startValue = parseFloat(data[h][startIndex]),
            stopValue = parseFloat(data[h][stopIndex])
          const value = startValue + ((stopValue - startValue) / (stopIndex - startIndex)) * (k + 1 - startIndex)

          interpolatedData[h - 2].push({ time: times[k + 1], index: k + 1, value: value })
          interpolatedIndices[h - 2].push((k + 1))
        }
        i = j
      }
    }
  }

  return [interpolatedData, interpolatedIndices]
}

export function checkInterpolated(ctx, i, value) {
  if (interpolatedIndices[i].includes(ctx.p0DataIndex) && interpolatedIndices[i].includes(ctx.p0DataIndex + 1)) return value
  else return undefined
}

export function newChartOptions(datasets, options) {
  return {
    type: "line",
    data: {
      labels: times,
      datasets: datasets
    },
    options: options,
    plugins: [tooltipLine]
  }
}

export function setLabelPostitions(labels, percentages) {
  for (let i = 0; i < labels.length; i++) {
    labels[i].style.top = percentages[i] + "%"
  }
}

export function changeTableSort(tableSort) {

  if (localStorage.getItem("tableSort") == "0") {
    localStorage.setItem("tableSort", "1")
    tableSort.innerHTML = `Tijd <span id="sortArrow">▲</span>`
  } else if (localStorage.getItem("tableSort") == "1") {
    localStorage.setItem("tableSort", "0")
    tableSort.innerHTML = `Tijd <span id="sortArrow">▼</span>`
  }

  contentUpdate()

}