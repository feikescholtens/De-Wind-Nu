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
  if (clickedOption == "Grafieken" && localStorage.getItem("dataForm") == "graphs") return
  if (clickedOption == "Tabel" && localStorage.getItem("dataForm") == "table") return

  if (clickedOption == "Grafieken") dataFormSelector.value = "graphs"
  if (clickedOption == "Tabel") dataFormSelector.value = "table"

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

  if (interpolation == "1") {
    const dataTypeArray = ["windSpeed", "windGusts", "windDirection"]
    dataTypeArray.forEach(dataType => {
      interpolatedData[dataType].forEach((element) => {
        dataWUnits[dataType][element.index] = element.value
      })
    })
  }
  contentUpdate()
}

export function unHideElements() {
  document.getElementsByTagName("header")[0].style.visibility = "visible"
  document.getElementsByTagName("main")[0].style.visibility = "visible"
  document.getElementsByTagName("footer")[0].style.visibility = "visible"

  document.querySelector("[data-markerContainer]").style.display = "none"
  document.querySelector("[data-loaderText]").style.display = "none"
}

export function calcInterpolation() {

  let interpolatedData = { windSpeed: [], windGusts: [], windDirection: [] },
    interpolatedIndices = { windSpeed: [], windGusts: [], windDirection: [] }

  const arraysToInterpolate = ["windSpeed", "windGusts", "windDirection"]
  arraysToInterpolate.forEach(dataType => {
    for (let i = 0; i < data[dataType].length; i++) {
      let j

      if (data[dataType][i] < 0) {
        for (j = i + 1; j < data[dataType].length; j++) {
          if (data[dataType][j] >= 0) break
        }

        const startIndex = i - 1,
          stopIndex = j

        for (let k = startIndex; k < stopIndex - 1; k++) {
          const startValue = parseFloat(data[dataType][startIndex]),
            stopValue = parseFloat(data[dataType][stopIndex])
          const value = startValue + ((stopValue - startValue) / (stopIndex - startIndex)) * (k + 1 - startIndex)

          interpolatedData[dataType].push({ time: times[k + 1], index: k + 1, value: value })
          interpolatedIndices[dataType].push((k + 1))
        }
        i = j
      }
    }
  })

  return { interpolatedData: interpolatedData, interpolatedIndices: interpolatedIndices }
}

export function checkInterpolated(ctx, dataType, value) {
  if (interpolatedIndices[dataType].includes(ctx.p0DataIndex) && interpolatedIndices[dataType].includes(ctx.p0DataIndex + 1)) return value
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

  if (localStorage.getItem("tableSort") == "ascending") {
    localStorage.setItem("tableSort", "descending")
    tableSort.innerHTML = `Tijd <span id="sortArrow">▲</span>`
  } else if (localStorage.getItem("tableSort") == "descending") {
    localStorage.setItem("tableSort", "ascending")
    tableSort.innerHTML = `Tijd <span id="sortArrow">▼</span>`
  }

  contentUpdate()

}