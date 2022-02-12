const tooltipLine = {
  id: 'tooltipLine',
  beforeDraw: chart => {
    if (chart.tooltip._active && chart.tooltip._active.length) {
      const ctx = chart.ctx;
      ctx.save();
      const activePoint = chart.tooltip._active[0];

      ctx.beginPath();
      ctx.setLineDash([5, 0]);
      ctx.moveTo(activePoint.element.x, chart.chartArea.top);
      ctx.lineTo(activePoint.element.x, chart.chartArea.bottom);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(111, 111, 111)';
      ctx.stroke();
      ctx.restore();
    }
  }
};

let datasetObject = {
  label: undefined,
  data: undefined,
  backgroundColor: undefined,
  borderColor: undefined,
  borderWidth: 2,
  pointHoverBorderColor: 'rgb(111, 111, 111)',
  pointHoverBackgroundColor: 'rgb(111, 111, 111)',
  pointHoverBorderWidth: '3',
  pointHoverRadius: 3
};

const datasetInfo = [{
    label: "Windsterkte",
    color: "rgba(106, 176, 76, 1)",
    bgColor: "rgba(106, 176, 76, 0.4)"
  },
  {
    label: "Windvlagen",
    color: "rgba(235, 77, 75, 1)",
    bgColor: "rgba(235, 77, 75, 0.4)"
  },
  {
    label: "Windrichting",
    color: "rgba(95, 39, 205, 1)",
    bgColor: "rgba(95, 39, 205, 0.4)"
  },
  {
    label: "Windsterkte voorspelling",
    color: "rgba(46, 134, 222, 1)",
    bgColor: "rgba(46, 134, 222, 0.4)"
  },
  {
    label: "Windrichting voorspelling",
    color: "rgba(255, 159, 67, 1)",
    bgColor: "rgba(255, 159, 67, 0.4)"
  },
  {
    label: "Windvlagen voorspelling",
    color: "rgba(255, 159, 243, 1)",
    bgColor: "rgba(255, 159, 243, 0.4)"
  }
]

const optionsWindspeedChart = {
  scales: {
    y: {
      display: true,
      title: {
        display: true,
        text: '',
        font: {
          family: 'Lato',
          size: '14',
        }
      },
      beginAtZero: true,
      ticks: {
        font: {
          family: 'Lato',
        }
      }
    },
    x: {
      ticks: {
        font: {
          family: 'Lato',
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
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      labels: {
        font: {
          size: 14,
          family: 'Lato',
          weight: 500
        },
        color: 'rgb(50, 50, 50)'
      }
    },
    tooltip: {
      callbacks: {
        label: undefined,
        title: undefined
      },
      titleFont: {
        size: 12,
        family: 'Lato'
      },
      bodyFont: {
        family: 'Lato'
      }
    }
  }
}

let optionsWinddirectionChart = JSON.parse(JSON.stringify(optionsWindspeedChart))
optionsWinddirectionChart.scales.y.title.text = "Windrichting [°]"
optionsWinddirectionChart.scales.y = {
  ...optionsWinddirectionChart.scales.y,
  ...{
    max: 360,
    min: 0,
    ticks: {
      stepSize: 22.5
    }
  }
}

optionsWindspeedChart.plugins.tooltip.callbacks.label = (context) => setLabels(context)
optionsWinddirectionChart.plugins.tooltip.callbacks.label = (context) => setLabels(context)

optionsWindspeedChart.plugins.tooltip.callbacks.title = (context) => setTitle(context)
optionsWinddirectionChart.plugins.tooltip.callbacks.title = (context) => setTitle(context)

function setLabels(context) {
  let label = context.dataset.label

  if (context.parsed.y !== null) {

    if (context.chart.id == 0) {
      if (context.datasetIndex == 0) {
        label = "Windsterkte: " + context.formattedValue + " " + units[unit].afkorting
      } else if (context.datasetIndex == 1) {
        label = "Windvlagen: " + context.formattedValue + " " + units[unit].afkorting
      } else if (context.datasetIndex == 2) {
        label = "Windsterkte voorspelling: " + context.formattedValue + " " + units[unit].afkorting
      } else if (context.datasetIndex == 3) {
        label = "Windvlagen voorspelling: " + context.formattedValue + " " + units[unit].afkorting
      }

    } else if (context.chart.id == 1) {
      label += ": " + context.formattedValue + "°"
    }
  }
  return label
}

function setTitle(context) {
  let title = context[0].label
  if (title !== null) {
    title = "Vandaag om " + title
  }
  return title
}