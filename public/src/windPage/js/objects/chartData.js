export const tooltipLine = {
  id: "tooltipLine",
  beforeDraw: chart => {
    if (chart.tooltip._active && chart.tooltip._active.length) {
      const ctx = chart.ctx
      ctx.save()
      const activePoint = chart.tooltip._active[0]

      ctx.beginPath()
      ctx.setLineDash([5, 0])
      ctx.moveTo(activePoint.element.x, chart.chartArea.top)
      ctx.lineTo(activePoint.element.x, chart.chartArea.bottom)
      ctx.lineWidth = 2
      ctx.strokeStyle = "rgb(111, 111, 111)"
      ctx.stroke()
      ctx.restore()
    }
  }
}

export const datasetObject = {
  borderWidth: 2,
  pointHoverBackgroundColor: "rgb(111, 111, 111)",
  pointHoverBorderWidth: 0,
  pointHoverRadius: 4
}

export const datasetInfo = {
  windSpeed: {
    label: "Windsterkte",
    labelCode: "windSpeed",
    borderColor: "rgba(106, 176, 76, 1)",
    backgroundColor: "rgba(106, 176, 76, 0.4)"
  },
  windGusts: {
    label: "Windvlagen",
    labelCode: "windGusts",
    borderColor: "rgba(235, 77, 75, 1)",
    backgroundColor: "rgba(235, 77, 75, 0.4)"
  },
  windDirection: {
    label: "Windrichting",
    labelCode: "windDirection",
    borderColor: "rgba(95, 39, 205, 1)",
    backgroundColor: "rgba(95, 39, 205, 0.4)"
  },
  windSpeedForecast: {
    label: "Windsterkte verwachting",
    labelCode: "windSpeedForecast",
    borderColor: "rgba(46, 134, 222, 1)",
    backgroundColor: "rgba(46, 134, 222, 0.4)"
  },
  windGustsForecast: {
    label: "Windvlagen verwachting",
    labelCode: "windGustsForecast",
    borderColor: "rgba(255, 159, 243, 1)",
    backgroundColor: "rgba(255, 159, 243, 0.4)"
  },
  windDirectionForecast: {
    label: "Windrichting verwachting",
    labelCode: "windDirectionForecast",
    borderColor: "rgba(255, 159, 67, 1)",
    backgroundColor: "rgba(255, 159, 67, 0.4)"
  }
}

export const optionsWindSpeedChart = {
  scales: {
    y: {
      display: true,
      title: {
        display: true,
        font: {
          family: "Lato",
          size: 14,
        }
      },
      beginAtZero: true,
      ticks: {
        font: {
          family: "Lato",
        }
      }
    },
    x: {
      ticks: {
        font: {
          family: "Lato",
        },
        maxTicksLimit: () => {
          if (document.body.clientWidth < 500) return 13
          else return 25
        }
      }
    }
  },
  radius: 0,
  tension: 0.3,
  tooltip: {
    enabled: true
  },
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    legend: {
      labels: {
        font: {
          size: 14,
          family: "Lato",
          weight: 500
        },
        // color: "red"
      },
      onClick: (event, element) => {
        const datasetIndex = element.datasetIndex
        let datasetName = element.text.split("|")[0]
        if (datasetName[datasetName.length - 1] == " ") datasetName = datasetName.slice(0, -1)

        const hiddenDatasets = JSON.parse(localStorage.getItem("hiddenDatasets"))

        if (event.chart.data.datasets[datasetIndex].hidden) {
          event.chart.data.datasets[datasetIndex].hidden = false

          hiddenDatasets[datasetName] = false
        } else {
          event.chart.data.datasets[datasetIndex].hidden = true

          hiddenDatasets[datasetName] = true
        }

        localStorage.setItem("hiddenDatasets", JSON.stringify(hiddenDatasets))
        event.chart.update()
      }
    },
    tooltip: {
      callbacks: {
        label: undefined,
        title: undefined
      },
      titleFont: {
        size: 12,
        family: "Lato"
      },
      bodyFont: {
        family: "Lato"
      }
    }
  }
}

export let optionsWindDirectionChart = JSON.parse(JSON.stringify(optionsWindSpeedChart)) //Watch out functions don't get cloned using this method
optionsWindDirectionChart.scales.y.title.text = "Windrichting [°]"
optionsWindDirectionChart.scales.y.max = 360
optionsWindDirectionChart.scales.y.min = 0
optionsWindDirectionChart.scales.y.ticks = {
  stepSize: 22.5,
  callback: (value) => { return value.toString().replace(".", ",") }
}
optionsWindDirectionChart.scales.x.ticks.maxTicksLimit = () => {
  if (document.body.clientWidth < 500) return 13
  else return 25
}

optionsWindSpeedChart.plugins.tooltip.callbacks.label = (context) => setLabels(context)
optionsWindDirectionChart.plugins.tooltip.callbacks.label = (context) => setLabels(context)

optionsWindSpeedChart.plugins.tooltip.callbacks.title = (context) => setTitle(context)
optionsWindDirectionChart.plugins.tooltip.callbacks.title = (context) => setTitle(context)

function setLabels(context) {
  let label = context.dataset.label

  if (context.parsed.y !== null) {
    const datasetLabel = datasetInfo[context.dataset.labelCode].label
    const valueFormatted = context.formattedValue.replace(".", ",")

    if (context.chart.id == 0) label = `${datasetLabel}: ${valueFormatted} ${unit}`
    else if (context.chart.id == 1) label += `: ${valueFormatted}°`
  }
  return label
}

function setTitle(context) {
  if (context[0].dataIndex == times.length - 1) return `${dateTomorrow} om ${context[0].label}`
  else return `${date} om ${context[0].label}`
}