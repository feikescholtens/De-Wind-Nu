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

let wind_obj = {
  label: 'Windsterkte',
  data: '',
  backgroundColor: 'rgba(106, 176, 76, 0.4)',
  borderColor: '#6ab04c',
  borderWidth: 2,
  pointHoverBorderColor: 'rgb(111, 111, 111)',
  pointHoverBackgroundColor: 'rgb(111, 111, 111)',
  pointHoverBorderWidth: '3',
  pointHoverRadius: 3
};

let wind_gusts_obj = {
  label: 'Windvlagen',
  data: '',
  backgroundColor: 'rgba(235, 77, 75, 0.4)',
  borderColor: '#eb4d4b',
  borderWidth: 2,
  pointHoverBorderColor: 'rgb(111, 111, 111)',
  pointHoverBackgroundColor: 'rgb(111, 111, 111)',
  pointHoverBorderWidth: '3',
  pointHoverRadius: 3
};

let winddirection_obj = {
  label: 'Windrichting',
  data: '',
  backgroundColor: 'rgba(95, 39, 205,0.4)',
  borderColor: '#5f27cd',
  borderWidth: 2,
  pointHoverBorderColor: 'rgb(111, 111, 111)',
  pointHoverBackgroundColor: 'rgb(111, 111, 111)',
  pointHoverBorderWidth: '3',
  pointHoverRadius: 3
};

let wind_forecast_obj = {
  label: 'Windvoorspelling',
  data: '',
  backgroundColor: 'rgba(46, 134, 222,0.4)',
  borderColor: '#2e86de',
  borderWidth: 2,
  pointHoverBorderColor: 'rgb(111, 111, 111)',
  pointHoverBackgroundColor: 'rgb(111, 111, 111)',
  pointHoverBorderWidth: '3',
  pointHoverRadius: 3
};

let winddirectionForecast_obj = {
  label: 'Windrichting voorspelling',
  data: '',
  backgroundColor: 'rgba(255, 159, 67,0.4)',
  borderColor: '#ff9f43',
  borderWidth: 2,
  pointHoverBorderColor: 'rgb(111, 111, 111)',
  pointHoverBackgroundColor: 'rgb(111, 111, 111)',
  pointHoverBorderWidth: '3',
  pointHoverRadius: 3
};

const options_chart = {
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
      beginAtZero: true
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
        label: function (context) {
          let label = context.dataset.label;
          let title = context.label;

          if (context.parsed.y !== null) {

            if (context.chart.id == 0) {
              if (context.datasetIndex == 0) {
                label = "Windsnelheid: " + context.formattedValue + " " + units[unit].afkorting;
              } else if (context.datasetIndex == 1) {
                label = "Windvlagen: " + context.formattedValue + " " + units[unit].afkorting;
              }
            } else if (context.chart.id == 1) {
              label += ": " + context.formattedValue + "°";
            }
          }
          return label;
        },
        title: function (context) {
          let title = context[0].label;
          if (title !== null) {
            title = "Vandaag om " + title;
          }
          return title;
        }
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

const directionChartTicks = {
  ticks: {
    max: 360,
    min: 0,
    ticks: {
      stepSize: 22.5
    }
  }
}