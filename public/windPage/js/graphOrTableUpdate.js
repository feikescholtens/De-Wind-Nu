import { newChartOptions, checkInterpolated } from "./functions.js"

const graphNodeElements = [document.querySelector("[data-headingchartwindspeed]"),
  document.querySelector("[data-chartwindSpeed]"),
  document.querySelector("[data-headingchartwinddirection]"),
  document.querySelector("[data-chartwindDirection]")
]
const tableNodeElements = [document.querySelector("[data-headingTabel]"),
  document.querySelector("[data-dataTable]")
]

export function updateGraphs() {

  graphNodeElements.forEach(element => element.classList.remove("noDisplay"))
  tableNodeElements.forEach(element => element.classList.add("noDisplay"))

  //Initialize datasets
  let datasets = datasetInfo.copy()

  const maxWindSpeed = Math.max(...dataWUnits.windSpeed.filter((value) => {
    return (!isNaN(value) && value !== undefined)
  }))
  const maxGusts = Math.max(...dataWUnits.windGusts.filter((value) => {
    return (!isNaN(value) && value !== undefined)
  }))

  datasets.windSpeed.label += ` | max: ${maxWindSpeed.toFixed(decimals).replace(".", ",")} ${unit}`
  datasets.windGusts.label += ` | max: ${maxGusts.toFixed(decimals).replace(".", ",")} ${unit}`
  const dataTypeArray = ["windSpeed", "windGusts", "windDirection", "windSpeedForecast", "windGustsForecast", "windDirectionForecast"]
  dataTypeArray.forEach(dataType => {
    datasets[dataType] = { ...datasets[dataType], ...datasetObject }
    if (dataWUnits[dataType]) datasets[dataType].data = dataWUnits[dataType]
  })
  if (interpolation == 1) {
    datasets.windSpeed.segment = { borderColor: ctx => checkInterpolated(ctx, "windSpeed", datasetInfo.windSpeed.backgroundColor) }
    datasets.windGusts.segment = { borderColor: ctx => checkInterpolated(ctx, "windGusts", datasetInfo.windGusts.backgroundColor) }
    datasets.windDirection.segment = { borderColor: ctx => checkInterpolated(ctx, "windDirection", datasetInfo.windDirection.backgroundColor) }
  }

  // Chart windspeed
  const canvasWindSpeed = document.querySelector("[data-chartWindSpeed]").getContext("2d")
  let chartWindSpeed, datasetsChartWindSpeed = []

  const dataTypesChartWindSpeed = ["windSpeed", "windGusts", "windSpeedForecast", "windGustsForecast"]
  dataTypesChartWindSpeed.forEach(dataType => {
    if (dataWUnits[dataType] && dataWUnits[dataType].length !== 0) datasetsChartWindSpeed.push(datasets[dataType])
  })

  optionsWindSpeedChart.scales.y.title.text = "Windsnelheid [" + unit + "]"

  if (!Chart.instances[0]) chartWindSpeed = new Chart(canvasWindSpeed, newChartOptions(datasetsChartWindSpeed, optionsWindSpeedChart))
  else {
    chartWindSpeed = Chart.instances[0]

    chartWindSpeed.data.labels = times
    chartWindSpeed.data.datasets = datasetsChartWindSpeed
    chartWindSpeed.options = optionsWindSpeedChart
    chartWindSpeed.update()
  }

  //Chart winddirection
  if (dataWUnits.windDirection.length == 0 && !dataWUnits.windDirectionForecast) {
    document.querySelector("[data-headingchartwinddirection]").classList.add("noDisplay")
    document.querySelector("[data-chartwindDirection]").classList.add("noDisplay")
    return
  }

  const canvasWindDirection = document.querySelector("[data-chartWindDirection]").getContext("2d")
  let chartWindDirection, datasetsChartWindDirection = []

  if (dataWUnits.windDirection.length !== 0) datasetsChartWindDirection.push(datasets.windDirection)
  if (dataWUnits.windDirectionForecast)
    if (dataWUnits.windDirectionForecast.length !== 0) datasetsChartWindDirection.push(datasets.windDirectionForecast)

  if (!Chart.instances[1]) chartWindDirection = new Chart(canvasWindDirection, newChartOptions(datasetsChartWindDirection, optionsWindDirectionChart))
  else {
    chartWindDirection = Chart.instances[1]

    chartWindDirection.data.labels = times
    chartWindDirection.data.datasets = datasetsChartWindDirection
    chartWindDirection.options = optionsWindDirectionChart
    chartWindDirection.update()
  }

}

export function updateTable() {

  graphNodeElements.forEach(element => element.classList.add("noDisplay"))
  tableNodeElements.forEach(element => element.classList.remove("noDisplay"))

  const tableHeaderRow = document.querySelector("[data-tableHeaderRow]")
  const table = document.querySelector("[data-dataTable]")

  const NoMeasurementTypesAvailable = [dataWUnits.windSpeed.length !== 0, dataWUnits.windGusts.length !== 0, dataWUnits.windDirection.length !== 0].filter(array => array !== false).length
  document.querySelector("[data-dataTable] th:nth-child(2)").setAttribute("colspan", NoMeasurementTypesAvailable)
  if (NoMeasurementTypesAvailable == 0 && document.querySelector("[data-dataTable] th:nth-child(2)").innerText == "Metingen") document.querySelector("[data-dataTable] th:nth-child(2)").remove()
  if (!dataWUnits.windSpeedForecast && document.querySelector("[data-dataTable] th:nth-child(3)")) document.querySelector("[data-dataTable] th:nth-child(3)").remove()

  //Clearing table
  for (let i = 2; i < table.rows.length;) table.deleteRow(i)
  tableHeaderRow.innerHTML = ""

  // Setting table values (first rows, then cells)
  const dataTypeArray = ["windSpeed", "windGusts", "windDirection", "windSpeedForecast", "windGustsForecast", "windDirectionForecast"]
  const headerTexts = { windSpeed: `sterkte [${unit}]`, windGusts: `vlagen [${unit}]`, windDirection: `richting [°]`, windSpeedForecast: `sterkte [${unit}]`, windGustsForecast: `vlagen [${unit}]`, windDirectionForecast: `richting [°]` }
  dataTypeArray.forEach(dataType => {
    if (dataWUnits[dataType] && dataWUnits[dataType].length !== 0) tableHeaderRow.innerHTML += `<th>${headerTexts[dataType]}</th>`
  })

  let lengthLongestArray = Math.max(...[dataWUnits.windSpeed.length, dataWUnits.windGusts.length, dataWUnits.windDirection.length])
  if (lengthLongestArray == 0) lengthLongestArray = dataWUnits.windSpeedForecast.length

  for (let i = 0; i < lengthLongestArray; i++) {
    const row = document.createElement("tr")

    const cellTime = document.createElement("td")
    cellTime.innerText = times[i]
    row.append(cellTime)

    dataTypeArray.forEach(dataType => {
      const cell = document.createElement("td")
      if (dataWUnits[dataType] && dataWUnits[dataType][i]) {
        cell.innerText = dataWUnits[dataType][i].replace(".", ",")
        row.append(cell)
      }
    })

    if (localStorage.getItem("tableSort") == "descending") tableHeaderRow.after(row)
    else if (localStorage.getItem("tableSort") == "ascending") table.append(row)

  }
}