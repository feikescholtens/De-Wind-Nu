import { drawUpdateChart } from "./drawUpdateChart.js"

export function changeUnit(unitSelector, decimalsSelector) {
  localStorage.setItem("unit", unitSelector.value)
  globalThis.unit = unitSelector.value
  if (unitSelector.value == 4) {
    decimalsSelector.setAttribute("disabled", "disabled")
    globalThis.decimals = 0
  } else decimalsSelector.removeAttribute("disabled")
  drawUpdateChart()
}

export function changeDecimals(decimalsSelector) {
  localStorage.setItem("decimals", decimalsSelector.value)
  drawUpdateChart()
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
  drawUpdateChart()
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