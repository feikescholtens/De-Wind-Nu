import { data } from "./testData.js"

const tooltipLine = {
  id: "tooltipLine",
  beforeDraw: chart => {
    if (chart.tooltip._active && chart.tooltip._active.length) {
      const ctx = chart.ctx
      ctx.save()
      const activePoint = chart.tooltip._active[0]
      const scaleDimensionsAndPositioning = chart.scales.radialScale
      const left = scaleDimensionsAndPositioning.left
      const width = scaleDimensionsAndPositioning.width
      const top = scaleDimensionsAndPositioning.top
      const height = scaleDimensionsAndPositioning.height

      ctx.beginPath()
      ctx.setLineDash([5, 0])
      ctx.moveTo(activePoint.element.x, activePoint.element.y)
      ctx.lineTo(left + 0.5 * width, top + 0.5 * height)
      ctx.lineWidth = 2
      ctx.strokeStyle = "rgb(111, 111, 111)"
      ctx.stroke()
      ctx.restore()

    }
  }
}

export const chartConfig = {
  type: 'WindDirectionChart',
  // maintainAspectRatio: true,
  // aspectRatio: 1,
  data: {
    labels: ['N', 'NNO', 'NO', 'ONO', 'O', 'OZO', 'ZO', 'ZZO', 'Z', 'ZZW', 'ZW', 'WZW', 'W', 'WNW', 'NW', 'NNW', ],
    datasets: [{
      label: "Windrichting",
      borderColor: "rgba(95, 39, 205, 1)",
      backgroundColor: "rgba(95, 39, 205, 0.4)",
      data: data,
    }],
  },
  options: {
    radius: 0,
    tension: 0.3,
    borderWidth: 3,
    scales: {
      radialScale: {
        id: "radialScale",
        angleLines: {
          color: '#000',
          lineWidth: 0.2,
          //display: false
        },
        pointLabels: {
          display: true,
          fontColor: '#485465',
          fontSize: 14,
        },
        type: 'radialLinear',
        grid: {
          circular: true,
        },
        min: 0,
        max: 1440,
        suggestedMax: 1440,
        ticks: {

          //backdropColor: 'blue',
          //reverse: true,
          //maxRotation: 45,
          //suggestedMin: 0,
          // minor: {
          //   display: true
          // },
          // major: {
          //   display: true
          // },
          //suggestedMin: 0,
          //suggestedMax: 6,

          //maxTicksLimit: 6,
          //precision: 0,
          stepSize: 1440 / 24 * 4,

          showLabelBackdrop: false,
          callback: function(value, index, values) {
            if (Number.isInteger(value)) {
              return makeTimeStampFromMinutes(value);
            }
            return '';
          },
        },
      },
      x: {
        title: {
          display: false,
        },
        grid: {
          display: false,
        },
        min: -1440,
        max: 1440,
        ticks: {

          display: false,
          stepSize: 1,
        },
      },

      y: {
        gridLines: {
          drawTicks: false,
        },

        title: {

          display: false,

        },

        grid: {
          display: false,
        },
        min: -1440,
        max: 1440,
        ticks: {
          display: false,
          stepSize: 1,
        },
      },
    },
    tooltip: {
      enabled: true
    },
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: function(data) {
            return (
              `Vandaag om ${makeTimeStampFromMinutes(data.raw.radius)}: ${data.raw.angle}°`
            );
          },
        },

      },
    }
  },
  plugins: [{
    beforeUpdate: function(chart, options) {
      for (let dataset of chart.config.data.datasets) {

        for (let point of dataset.data) {

          function toRadians(degrees) {
            return (((360 - degrees) / 360) * (Math.PI * 2))
          }
          const x = point.radius * Math.cos(toRadians(point.angle - 90));
          const y = point.radius * Math.sin(toRadians(point.angle - 90));

          point.x = Number(x.toFixed(4));
          point.y = Number(y.toFixed(4));

        }

      }

    },
    beforeDraw: function({ ctx, height, width }) {
      ctx.fillStyle = '#efefef'; // your color here
      ctx.fillRect(0, 0, width, height);
    },
    afterUpdate: function({ ctx, _metasets }) {
      // const data = _metasets[0].data

      // for (let i = 0; i < data.length; i++) {
      //   if (!data[i + 1]) return

      //   setTimeout(() => {
      //     ctx.beginPath()
      //     ctx.setLineDash([5, 0])
      //     ctx.moveTo(data[i].x, data[i].y)
      //     ctx.lineTo(data[i + 1].x, data[i + 1].y)
      //     ctx.lineWidth = 2
      //     ctx.strokeStyle = "rgb(111, 111, 111)"
      //     ctx.stroke()
      //     ctx.restore()


      //   }, 1000)







      // }
    }
  }, tooltipLine],
};



function makeTimeStampFromMinutes(totalMinutes) {
  let hours = Math.floor(totalMinutes / 60)
  let minutes = totalMinutes - hours * 60

  if (hours < 10) hours = `0${hours}`
  if (minutes < 10) minutes = `0${minutes}`

  let timeStamp = `${ hours }:${ minutes }`
  if (timeStamp == "24:00") timeStamp = "00:00"

  return timeStamp
}