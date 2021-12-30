import { updateCurrentWind } from "./updateDisplayCurrentWind.js"
import { convertToBft } from "./convertToBft.js"
import { newChartOptions, checkInterpolated } from "./functions.js"

export async function drawUpdateChart() {

  const unitSelector = document.getElementById("eenheid")
  globalThis.unit = localStorage.getItem("unit")
  if (unitSelector.value == 4) globalThis.decimals = 0
  else globalThis.decimals = localStorage.getItem("decimals")
  globalThis.interpolation = localStorage.getItem("interpolation")

  const canvasWindspeed = document.getElementById('chart_windspeed').getContext('2d')
  const canvasWinddirection = document.getElementById('chart_winddirection').getContext('2d')
  let chartWindspeed, chartWinddirection, datasetsChartWindspeed = [],
    datasetsChartWinddirection = []

  //This 'backup' is restored to the original 'data' variable so interpolation setting can change on the fly
  const data_before_interpolation = data.copy()

  for (let j = 2; j < 6 + 1; j++) {
    if (data[j]) {
      for (let k = 0; k < times.length; k++) {
        if (data[j][k] < 0) {
          if (interpolation == "1") {

            if (j == 2 || j == 3 || j == 4) {
              const interpolatedValue = interpolatedData[j - 2].filter(element => element.index == k)[0].value

              if (j == 2 || j == 3) data[j][k] = interpolatedValue
              if (j == 4) data[j][k] = interpolatedValue

            } else data[j][k] = undefined

          } else data[j][k] = undefined
        }
      }
    }
  }

  if (parseInt(unit) !== 4) {

    for (let i = 0; i < data_unit[2].length; i++) {
      if (data_unit[2][i]) data_unit[2][i] = (units[unit].factor * data[2][i]).toFixed(decimals)
    }

    if (data_unit[3].length !== 0) {
      for (let i = 0; i < data_unit[3].length; i++) {
        if (data_unit[3][i]) data_unit[3][i] = (units[unit].factor * data[3][i]).toFixed(decimals)
      }
    }

    if (data_unit[5]) {
      for (let i = 0; i < data_unit[5].length; i++) {
        if (data_unit[5][i]) data_unit[5][i] = (units[unit].factor * data[5][i]).toFixed(decimals)
      }
    }

  } else if (parseInt(unit) == 4) {

    //The 1 * is to convert undefined to NaN to prevent raising an error message

    for (let i = 0; i < data_unit[2].length; i++) {
      if (data_unit[2][i]) data_unit[2][i] = (1 * data[2][i]).toFixed(decimals)
    }

    if (data_unit[3].length !== 0) {
      for (let i = 0; i < data_unit[3].length; i++) {
        if (data_unit[3][i]) data_unit[3][i] = (1 * data[3][i]).toFixed(decimals)
      }
    }

    if (data_unit[5]) {
      for (let i = 0; i < data_unit[5].length; i++) {
        if (data_unit[5][i]) data_unit[5][i] = (1 * data[5][i]).toFixed(decimals)
      }
    }

    convertToBft(data, data_unit)
  }

  if (data_unit[4].length !== 0) {
    for (let i = 0; i < data_unit[4].length; i++) {
      if (data_unit[4][i]) data_unit[4][i] = (1 * data[4][i]).toFixed(0)
    }
  }

  updateCurrentWind()

  //Initialize datasets

  let datasets = new Array(datasetInfo.length).fill(datasetObject).copy()

  const maxWind = Math.max(...data_unit[2].filter((value) => {
    return (value !== "NaN" && value !== undefined)
  }))
  const maxGusts = Math.max(...data_unit[3].filter((value) => {
    return (value !== "NaN" && value !== undefined)
  }))

  for (let i = 0; i < datasets.length; i++) {
    datasets[i].backgroundColor = datasetInfo[i].bgColor
    datasets[i].borderColor = datasetInfo[i].color
    if (i == 0) datasets[0].label = datasetInfo[0].label + ` | max: ${maxWind.toFixed(decimals).replace(".", ",")} ${units[unit].afkorting}`
    else if (i == 1) datasets[1].label = datasetInfo[1].label + ` | max: ${maxGusts.toFixed(decimals).replace(".", ",")} ${units[unit].afkorting}`
    else datasets[i].label = datasetInfo[i].label
    if (data_unit[i + 2]) datasets[i].data = data_unit[i + 2]

    if (i <= 2) datasets[i].segment = { borderColor: ctx => checkInterpolated(ctx, i, datasetInfo[i].bgColor) }

  }

  // Chart windspeed

  datasetsChartWindspeed.push(datasets[0])
  if (data_unit[3].length !== 0) datasetsChartWindspeed.push(datasets[1])
  if (data_unit[5])
    if (data_unit[5].length !== 0) datasetsChartWindspeed.push(datasets[3])

  optionsWindspeedChart.scales.y.title.text = "Windsnelheid [" + units[unit].afkorting + "]"

  if (!Chart.instances[0]) chartWindspeed = new Chart(canvasWindspeed, newChartOptions(datasetsChartWindspeed, optionsWindspeedChart))
  else {
    chartWindspeed = Chart.instances[0]

    chartWindspeed.data.datasets = datasetsChartWindspeed
    chartWindspeed.options = optionsWindspeedChart
    chartWindspeed.update()
  }

  //Chart winddirection

  datasetsChartWinddirection.push(datasets[2])
  if (data_unit[6])
    if (data_unit[6].length !== 0) datasetsChartWinddirection.push(datasets[4])

  if (!Chart.instances[1]) chartWinddirection = new Chart(canvasWinddirection, newChartOptions(datasetsChartWinddirection, optionsWinddirectionChart))
  else {
    chartWinddirection = Chart.instances[1]

    chartWinddirection.data.datasets = datasetsChartWinddirection
    chartWinddirection.options = optionsWinddirectionChart
    chartWinddirection.update()
  }

  data = data_before_interpolation.copy()

}