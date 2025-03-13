import { chartConfig } from "./chartConfig.js";

class WindDirectionChart extends Chart.controllers.scatter {
  draw() {
    // Call bubble controller method to draw all the points
    if (this.chart.config._config.options.radius !== 0) super.draw(arguments);

    // Now we can do some custom drawing for this dataset. Here we'll draw a red box around the first point in each dataset
    const meta = this.getMeta();
    const data = meta.data
    const ctx = this.chart.ctx;

    console.log(this.getMeta().controller.chart.scales.radialScale)
    const scaleDimensionsAndPositioning = meta.controller.chart.scales.radialScale
    const left = scaleDimensionsAndPositioning.left
    const width = scaleDimensionsAndPositioning.width
    const top = scaleDimensionsAndPositioning.top
    const height = scaleDimensionsAndPositioning.height

    for (let i = 0; i < data.length; i++) {
      if (!data[i + 1]) return

      ctx.beginPath()
      ctx.setLineDash([5, 0])
      ctx.moveTo(data[i].x, data[i].y)
      ctx.lineTo(data[i + 1].x, data[i + 1].y)
      ctx.lineWidth = this.chart.config._config.options.borderWidth
      ctx.strokeStyle = meta.dataset.options.borderColor
      ctx.stroke()

      const anglePoint = data[i].$context.raw.angle
      const angleNextPoint = data[i + 1].$context.raw.angle
      const a = cotangent(anglePoint - 90)
      const a_next = cotangent(angleNextPoint - 90)
      const theta = Math.tan(a)
      const theta_next = Math.tan(a_next)

      function getInterSectCanvas() {
        console.log('------')
        const a = cotangent(anglePoint - 90)
        const a_next = cotangent(angleNextPoint - 90)
        const theta = Math.tan(a)
        const theta_next = Math.tan(a_next)

        const x = data[i].x,
          y = -data[i].y
        const b = y - a * x

        const x_next = data[i + 1].x,
          y_next = -data[i + 1].y
        const b_next = y_next - a_next * x_next

        const x_s = (b_next - b) / (a - a_next)
        const y_s = a * x_s + b

        return [x_s, y_s]
      }

      if (anglePoint == 339) {

        const [x_s, y_s] = getInterSectCanvas()

        // ctx.beginPath()
        // ctx.rect(x_s, -y_s, 5, 5)
        // ctx.fill()


        ctx.moveTo(data[i].x, data[i].y)
        ctx.quadraticCurveTo(x_s, -y_s, data[i + 1].x, data[i + 1].y);

        ctx.lineWidth = this.chart.config._config.options.borderWidth
        ctx.strokeStyle = meta.dataset.options.borderColor
        ctx.stroke()
      }

    }




  }
}

function pythagorean(sideA, sideB) {
  return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));
}

function toRadians(angleDeg) {
  return (angleDeg / 360) * (2 * Math.PI)
}

function cotangent(angleDeg) {
  const angleRed = (angleDeg / 360) * (2 * Math.PI)
  return Math.cos(angleRed) / Math.sin(angleRed)
}

WindDirectionChart.id = "WindDirectionChart"
WindDirectionChart.defaults = Chart.controllers.scatter.defaults;


Chart.register(WindDirectionChart);

var ctx = document.getElementById('myChart');
ctx.height = ctx.clientWidth

var myChart = new Chart(ctx, chartConfig);
console.log(Chart.elements.PointElement.prototype)

function updateData() {
  myChart.update();
  const radialScale = myChart.boxes.filter(
    (b) => b.id === 'radialScale'
  )[0];

  //debugger;
  var helpers = Chart.helpers;
  var globalDefaults = Chart.defaults;
  var me = radialScale
  var opts = radialScale.options;
  var gridLineOpts = opts.grid;
  var tickOpts = opts.ticks;
  var valueOrDefault = helpers.valueOrDefault;
  console.log("d")

  if (1) {
    var ctx = me.ctx;
    var startAngle = radialScale.getIndexAngle(0);

    // Tick Font
    var tickFontSize = valueOrDefault(
      tickOpts.fontSize,
      globalDefaults.defaultFontSize
    );
    var tickFontStyle = valueOrDefault(
      tickOpts.fontStyle,
      globalDefaults.defaultFontStyle
    );
    var tickFontFamily = valueOrDefault(
      tickOpts.fontFamily,
      globalDefaults.defaultFontFamily
    );
    var tickLabelFont = helpers.fontString(
      tickFontSize,
      tickFontStyle,
      tickFontFamily
    );

    helpers.each(me.ticks, function(label, index) {
      // Don't draw a centre value (if it is minimum)
      if (index > 0 || tickOpts.reverse) {
        var yCenterOffset = me.getDistanceFromCenterForValue(
          // me.ticksAsNumbers[index]
        );

        // Draw circular lines around the scale
        if (gridLineOpts.display && index !== 0) {
          //debugger
          drawRadiusLine(me, gridLineOpts, yCenterOffset, index);

        }


        if (tickOpts.display) {
          var tickFontColor = valueOrDefault(
            tickOpts.fontColor,
            globalDefaults.defaultFontColor
          );
          ctx.font = tickLabelFont;

          ctx.save();
          ctx.translate(me.xCenter, me.yCenter);
          ctx.rotate(startAngle);

          if (tickOpts.showLabelBackdrop) {
            var labelWidth = ctx.measureText(label).width;
            ctx.fillStyle = tickOpts.backdropColor;
            ctx.fillRect(
              -labelWidth / 2 - tickOpts.backdropPaddingX,
              -yCenterOffset - tickFontSize / 2 - tickOpts.backdropPaddingY,
              labelWidth + tickOpts.backdropPaddingX * 2,
              tickFontSize + tickOpts.backdropPaddingY * 2
            );
          }

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = tickFontColor;
          ctx.fillText(label, yCenterOffset, -20);
          //ctx.fillText(label, 0, -yCenterOffset);
          ctx.restore();
        }
      }
    });

    if (opts.angleLines.display || opts.pointLabels.display) {
      drawPointLabels(me);
    }

  }


  radialScale.setReductions = function() {
    // debugger;
    let largestPossibleRadius = Math.min(this.height / 2, this.width / 2);
    this.drawingArea = Math.round(largestPossibleRadius);
    this.setCenterPoint(0, 0, 0, 0);
  };

  function drawRadiusLine(scale, gridLineOpts, radius, index) {

    var helpers = Chart.helpers;
    var globalDefaults = Chart.defaults;
    var ctx = scale.ctx;
    // ctx.strokeStyle = helpers.valueAtIndexOrDefault(
    //   gridLineOpts.color,
    //   index - 1
    // );
    // ctx.lineWidth = helpers.valueAtIndexOrDefault(
    //   gridLineOpts.lineWidth,
    //   index - 1
    // );
    //debugger
    if (scale.options.grid.circular) {
      //if (false) {
      // Draw circular arcs between the points
      ctx.beginPath();
      ctx.arc(scale.xCenter, scale.yCenter, radius, 0, Math.PI * 2);

      ctx.closePath();
      ctx.stroke();

      // This is required for x-axis tick
      var valueCount = getValueCount(scale);

      if (valueCount === 0) {
        return;
      }
      for (var i = 1; i < valueCount; i++) {
        if (i == valueCount / 4) {
          ctx.beginPath();
          var pointPosition = scale.getPointPosition(i, radius);
          ctx.moveTo(pointPosition.x, pointPosition.y);
          ctx.strokeStyle = '#000';
          ctx.lineTo(pointPosition.x, pointPosition.y - 10);
          ctx.closePath();
          ctx.stroke();
        }
      }
      // This is required for x-axis tick
    }
  }

  function drawPointLabels(scale) {
    //debugger
    var helpers = Chart.helpers;
    var globalDefaults = Chart.defaults;
    var ctx = scale.ctx;
    var opts = scale.options;
    var angleLineOpts = opts.angleLines;
    var pointLabelOpts = opts.pointLabels;

    ctx.lineWidth = angleLineOpts.lineWidth;
    ctx.strokeStyle = angleLineOpts.color;
    //debugger;
    var outerDistance = scale.getDistanceFromCenterForValue(
      opts.ticks.reverse ? scale.min : scale.max
    );

    // Point Label Font
    var plFont = getPointLabelFontOptions(scale);

    ctx.textBaseline = 'top';
    for (var i = getValueCount(scale) - 1; i >= 0; i--) {
      if (angleLineOpts.display) {
        // This overriden is required to skip angleLines
        // of WTR/ATR Labels
        if (i % 2 === 0) {
          //debugger;
          var outerPosition = scale.getPointPosition(i, outerDistance);
          ctx.beginPath();
          ctx.moveTo(scale.xCenter, scale.yCenter);

          //ctx.lineTo(outerPosition.x, outerPosition.y);
          var valueCount = getValueCount(scale);
          if (i === valueCount / 4) {
            // ctx.beginPath();
            // ctx.moveTo(scale.xCenter, scale.yCenter);
            // ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.lineTo(outerPosition.x, outerPosition.y);
            ctx.stroke();
            ctx.closePath();
          } else {
            ctx.lineWidth = 0.2;
            //ctx.strokeStyle = '#000';
            ctx.lineTo(outerPosition.x, outerPosition.y);
            ctx.stroke();
            ctx.closePath();
          }
        }
        //}
      }

      if (pointLabelOpts.display) {
        // Extra 3px out for some label spacing
        var pointLabelPosition = scale.getPointPosition(i, outerDistance + 13);

        // Keep this in loop since we may support array properties here
        // var pointLabelFontColor = helpers.valueAtIndexOrDefault(
        //   pointLabelOpts.fontColor,
        //   i,
        //   globalDefaults.defaultFontColor
        // );
        ctx.font = plFont.font;
        // ctx.fillStyle = pointLabelFontColor;

        var angleRadians = scale.getIndexAngle(i);
        var angle = helpers.toDegrees(angleRadians);
        ctx.textAlign = getTextAlignForAngle(angle);
        adjustPointPositionForLabelHeight(
          angle,
          // scale._pointLabelSizes[i],
          pointLabelPosition
        );
        fillText(
          ctx,
          // scale.pointLabels[i] || '',
          pointLabelPosition,
          plFont.size
        );
      }
    }
  }

  function getPointLabelFontOptions(scale) {
    var helpers = Chart.helpers;
    var globalDefaults = Chart.defaults;
    var pointLabelOptions = scale.options.pointLabels;
    var fontSize = helpers.valueOrDefault(
      pointLabelOptions.fontSize,
      globalDefaults.defaultFontSize
    );
    var fontStyle = helpers.valueOrDefault(
      pointLabelOptions.fontStyle,
      globalDefaults.defaultFontStyle
    );
    var fontFamily = helpers.valueOrDefault(
      pointLabelOptions.fontFamily,
      globalDefaults.defaultFontFamily
    );
    var font = helpers.fontString(fontSize, fontStyle, fontFamily);

    return {
      size: fontSize,
      style: fontStyle,
      family: fontFamily,
      font: font,
    };
  }

  function getValueCount(scale) {
    var opts = scale.options;
    return opts.angleLines.display || opts.pointLabels.display ?
      scale.chart.data.labels.length :
      0;
  }

  function getTextAlignForAngle(angle) {
    if (angle === 0 || angle === 180) {
      return 'center';
    } else if (angle < 180) {
      return 'left';
    }

    return 'right';
  }

  function adjustPointPositionForLabelHeight(angle, textSize, position) {
    if (angle === 90 || angle === 270) {
      // position.y -= textSize.h / 2;
    } else if (angle > 270 || angle < 90) {
      // position.y -= textSize.h;
    }
  }

  function fillText(ctx, text, position, fontSize) {
    var helpers = Chart.helpers;
    var globalDefaults = Chart.defaults;
    if (helpers.isArray(text)) {
      var y = position.y;
      var spacing = 1.5 * fontSize;

      for (var i = 0; i < text.length; ++i) {
        ctx.fillText(text[i], position.x, y);
        y += spacing;
      }
    } else {
      ctx.fillText(text, position.x, position.y);
    }
  }
}
updateData();