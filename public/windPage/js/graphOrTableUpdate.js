import { newChartOptions, checkInterpolated } from "./functions.js"

const graphNodeElements = [document.querySelector("[data-headingchartwindspeed]"),
  document.querySelector("[data-chartwindspeed]"),
  document.querySelector("[data-headingchartwinddirection]"),
  document.querySelector("[data-chartwinddirection]")
]
const tableNodeElements = [document.querySelector("[data-headingTabel]"),
  document.querySelector("[data-dataTable]")
]

export function updateGraphs() {

  graphNodeElements.forEach(element => element.classList.remove("hidden"))
  tableNodeElements.forEach(element => element.classList.add("hidden"))

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
  const canvasWindspeed = document.querySelector("[data-chartWindspeed]").getContext("2d")
  let chartWindspeed, datasetsChartWindspeed = []

  if (data_unit[2].length !== 0) datasetsChartWindspeed.push(datasets[0])
  if (data_unit[3].length !== 0) datasetsChartWindspeed.push(datasets[1])
  if (data_unit[5])
    if (data_unit[5].length !== 0) datasetsChartWindspeed.push(datasets[3])
  if (data_unit[7])
    if (data_unit[7].length !== 0) datasetsChartWindspeed.push(datasets[5])

  optionsWindspeedChart.scales.y.title.text = "Windsnelheid [" + units[unit].afkorting + "]"

  if (!Chart.instances[0]) chartWindspeed = new Chart(canvasWindspeed, newChartOptions(datasetsChartWindspeed, optionsWindspeedChart))
  else {
    chartWindspeed = Chart.instances[0]

    chartWindspeed.data.datasets = datasetsChartWindspeed
    chartWindspeed.options = optionsWindspeedChart
    chartWindspeed.update()
  }

  //Chart winddirection
  if (data_unit[4].length == 0 && !data_unit[6]) {
    document.querySelector("[data-headingchartwinddirection]").classList.add("hidden")
    document.querySelector("[data-chartwinddirection]").classList.add("hidden")
    return
  }

  document.querySelector("[data-headingchartwinddirection]").classList.remove("hidden")
  document.querySelector("[data-chartwinddirection]").classList.remove("hidden")
  const canvasWinddirection = document.querySelector("[data-chartWinddirection]").getContext("2d")
  let chartWinddirection, datasetsChartWinddirection = []

  if (data_unit[4].length !== 0) datasetsChartWinddirection.push(datasets[2])
  if (data_unit[6])
    if (data_unit[6].length !== 0) datasetsChartWinddirection.push(datasets[4])

  if (!Chart.instances[1]) chartWinddirection = new Chart(canvasWinddirection, newChartOptions(datasetsChartWinddirection, optionsWinddirectionChart))
  else {
    chartWinddirection = Chart.instances[1]

    chartWinddirection.data.datasets = datasetsChartWinddirection
    chartWinddirection.options = optionsWinddirectionChart
    chartWinddirection.update()
  }

}

export function updateTable() {

  graphNodeElements.forEach(element => element.classList.add("hidden"))
  tableNodeElements.forEach(element => element.classList.remove("hidden"))

  const tableHeaderRow = document.querySelector("[data-tableHeaderRow]")
  const table = document.querySelector("[data-dataTable]")

  const NoMeasurementTypesAvailable = [data_unit[2].length !== 0, data_unit[3].length !== 0, data_unit[4].length !== 0].filter(array => array !== false).length;
  document.querySelector("[data-dataTable] th:nth-child(2)").setAttribute("colspan", NoMeasurementTypesAvailable)
  if (NoMeasurementTypesAvailable == 0 && document.querySelector("[data-dataTable] th:nth-child(2)").innerText == "Metingen") document.querySelector("[data-dataTable] th:nth-child(2)").remove()
  if (!data_unit[5] && document.querySelector("[data-dataTable] th:nth-child(3)")) document.querySelector("[data-dataTable] th:nth-child(3)").remove()

  //Clearing table
  for (let i = 2; i < table.rows.length;) table.deleteRow(i)
  tableHeaderRow.innerHTML = ""

  //Setting table values (first rows, then cells)
  if (data_unit[2].length !== 0) tableHeaderRow.innerHTML += `<th>sterkte [${units[unit].afkorting}]</th>`
  if (data_unit[3].length !== 0) tableHeaderRow.innerHTML += `<th>vlagen [${units[unit].afkorting}]</th>`
  if (data_unit[4].length !== 0) tableHeaderRow.innerHTML += `<th>richting [°]</th>`
  if (data_unit[5])
    if (data_unit[5].length !== 0) tableHeaderRow.innerHTML += `<th>sterkte [${units[unit].afkorting}]</th>`
  if (data_unit[7])
    if (data_unit[7].length !== 0) tableHeaderRow.innerHTML += `<th>vlagen [${units[unit].afkorting}]</th>`
  if (data_unit[6])
    if (data_unit[6].length !== 0) tableHeaderRow.innerHTML += `<th>richting [°]</th>`

  let lengthLongestArray = Math.max(...[data_unit[2].length, data_unit[3].length, data_unit[4].length])
  if (lengthLongestArray == 0) lengthLongestArray = data_unit[5].length

  for (let i = 0; i < lengthLongestArray; i++) {
    const row = document.createElement("tr")

    const cellTime = document.createElement("td")
    cellTime.innerText = data_unit[1][i]
    row.append(cellTime)

    if (data_unit[2].length !== 0 && data_unit[2][i]) {
      const cellWind = document.createElement("td")
      if (data_unit[2][i]) cellWind.innerText = data_unit[2][i].replace(".", ",")
      row.append(cellWind)
    }
    if (data_unit[3].length !== 0 && data_unit[3][i]) {
      const cellGusts = document.createElement("td")
      cellGusts.innerText = data_unit[3][i].replace(".", ",")
      row.append(cellGusts)
    }
    if (data_unit[4].length !== 0 && data_unit[4][i]) {
      const cellDirection = document.createElement("td")
      cellDirection.innerText = data_unit[4][i]
      row.append(cellDirection)
    }
    if (data_unit[5]) {
      if (data_unit[5].length !== 0 && data_unit[5][i]) {
        const cellForecast = document.createElement("td")
        cellForecast.innerText = data_unit[5][i].replace(".", ",")
        row.append(cellForecast)
      }
    }
    if (data_unit[7]) {
      if (data_unit[7].length !== 0 && data_unit[7][i]) {
        const cellForecastGusts = document.createElement("td")
        cellForecastGusts.innerText = data_unit[7][i].replace(".", ",")
        row.append(cellForecastGusts)
      }
    }
    if (data_unit[6]) {
      if (data_unit[6].length !== 0 && data_unit[6][i]) {
        const cellForecastDirection = document.createElement("td")
        cellForecastDirection.innerText = data_unit[6][i]
        row.append(cellForecastDirection)
      }
    }

    if (localStorage.getItem("tableSort") == "1") tableHeaderRow.after(row)
    else if (localStorage.getItem("tableSort") == "0") table.append(row)

  }
}