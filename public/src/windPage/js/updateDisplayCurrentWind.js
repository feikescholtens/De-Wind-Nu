import { drawDirectionArrow, drawCanvasBackground } from "./drawCanvas.js"
import { directionToLetters } from "../../globalFunctions.js"
import { setLabelPostitions } from "./functions.js"

Array.prototype.lastMeasurement = function() { return this[this.length - 1] }
let directionStuffDrawn = false

export function updateCurrentWind(forceRedraw) {

  const currentWindLabel = document.querySelector("[data-currentWind]")
  const forecastedWindLabel = document.querySelector("[data-forecastedWind]")
  const currentGustsLabel = document.querySelector("[data-currentGusts]")
  const currentDirectionLabel = document.querySelector("[data-currentDirection]")
  const forecastedDirectionLabel = document.querySelector("[data-forecastedDirection]")

  const headingWithTime = document.querySelector("[data-headingCurrentWind]")
  const ctx = document.querySelector("[data-compass]").getContext("2d")

  //Setting winddirection values / arrows
  if (forceRedraw) {
    ctx.clearRect(0, 0, document.querySelector("[data-compass]").width, document.querySelector("[data-compass]").height)
    directionStuffDrawn = false
  }
  if (!directionStuffDrawn) {
    drawCanvasBackground(ctx)

    if (dataWUnits.windDirectionForecast) {
      if (dataWUnits.windDirectionForecast.length !== 0) {
        const forecastedDirection = dataWUnits.windDirectionForecast[dataWUnits.windDirection.length - 1]
        if (forecastedDirection) {
          drawDirectionArrow(forecastedDirection, ctx, "#ff9f43")
          forecastedDirectionLabel.innerHTML = forecastedDirection + "&#176;<label class='measurementTypeIndicator labelSmall'> voorspeld</label>"
        }
      }
    }

    const currentDirection = dataWUnits.windDirection.lastMeasurement()
    if (currentDirection && !isNaN(currentDirection)) {
      drawDirectionArrow(currentDirection, ctx, "#5f27cd")
      const currentDirectionLetters = directionToLetters(currentDirection)
      currentDirectionLabel.innerHTML = currentDirection + "&#176; / " + currentDirectionLetters
    }

    directionStuffDrawn = true
  }

  //Setting numerical values (not of winddirection data, that never changes without page reload)

  if (dataWUnits.windSpeed.length !== 0) currentWindLabel.innerText = `${dataWUnits.windSpeed.lastMeasurement().replace(".", ",")} ${unit}`
  if (dataWUnits.windGusts.length !== 0) {
    currentGustsLabel.innerHTML = `${dataWUnits.windGusts.lastMeasurement().replace(".", ",")} ${unit} <label class='measurementTypeIndicator labelBig'>&nbsp;vlagen</label>`
  }
  if (dataWUnits.windSpeedForecast) {
    if (dataWUnits.windSpeedForecast.length !== 0 && dataWUnits.windSpeedForecast[dataWUnits.windDirection.length - 1]) {
      forecastedWindLabel.innerHTML = `${dataWUnits.windSpeedForecast[dataWUnits.windDirection.length - 1].replace(".", ",")} ${unit} <label class='measurementTypeIndicator labelSmall'> voorspeld</label>`
    }
  } else forecastedWindLabel.innerHTML = ""

  //Setting positions

  const labels = [currentWindLabel, forecastedWindLabel, currentGustsLabel, currentDirectionLabel, forecastedDirectionLabel]

  if (currentGustsLabel.innerHTML !== "" && forecastedDirectionLabel.innerHTML !== "" && forecastedWindLabel.innerHTML !== "")
    setLabelPostitions(labels, [9, 36, 54, 75, 91])
  if (currentGustsLabel.innerHTML !== "" && forecastedDirectionLabel.innerHTML == "" && forecastedWindLabel.innerHTML == "")
    setLabelPostitions(labels, [20, 0, 50, 75, 0])
  if (currentGustsLabel.innerHTML == "" && forecastedDirectionLabel.innerHTML !== "" && forecastedWindLabel.innerHTML !== "")
    setLabelPostitions(labels, [16, 44, 0, 65, 86])
  if (currentGustsLabel.innerHTML !== "" && forecastedDirectionLabel.innerHTML == "" && forecastedWindLabel.innerHTML !== "")
    setLabelPostitions(labels, [17, 43, 63, 85, 0])
  if (currentGustsLabel.innerHTML !== "" && forecastedDirectionLabel.innerHTML !== "" && forecastedWindLabel.innerHTML == "")
    setLabelPostitions(labels, [17, 0, 45, 70, 88])
  if (currentGustsLabel.innerHTML == "" && forecastedDirectionLabel.innerHTML == "" && forecastedWindLabel.innerHTML == "")
    setLabelPostitions(labels, [32, 0, 0, 62, 0])

  const lastMeasurementTimeBasedOn = dataWUnits.windSpeed.length || dataWUnits.windDirection.length
  const lastMeasurementTime = dataWUnits.times[lastMeasurementTimeBasedOn - 1]

  const lastMeasurementHH = parseInt(lastMeasurementTime.split(":")[0])
  const lastMeasurementmm = parseInt(lastMeasurementTime.split(":")[1])
  const nowHH = new Date().getHours()
  const nowmm = new Date().getMinutes()

  const minutesSinceLastMeasurement = nowHH * 60 + nowmm - (lastMeasurementHH * 60 + lastMeasurementmm)

  if (minutesSinceLastMeasurement > 0)
    headingWithTime.innerHTML = `Recentste meting (${minutesSinceLastMeasurement} minuten geleden)`
  else
    headingWithTime.innerHTML = `Recentste meting (${new Date().getSeconds()} seconden geleden)`

}