import { drawDirectionArrow } from "./drawDirectionArrow.js"
import { directionToLetters } from "./directionToLetters.js"
import { setLabelPostitions } from "./functions.js"

Array.prototype.lastMeasurement = function() { return this[this.length - 1] }
let directionStuffDrawn = false

export function updateCurrentWind() {

  const currentWindLabel = document.querySelector("[data-currentWind]")
  const forecastedWindLabel = document.querySelector("[data-forecastedWind]")
  const currentGustsLabel = document.querySelector("[data-currentGusts]")
  const currentDirectionLabel = document.querySelector("[data-currentDirection]")
  const forecastedDirectionLabel = document.querySelector("[data-forecastedDirection]")

  const headingWithTime = document.querySelector("[data-headingCurrentWind]")
  const ctx = document.querySelector("[data-compass]").getContext("2d")

  //Setting winddirection values / arrows

  if (!directionStuffDrawn) {
    if (data_unit[6]) {
      if (data_unit[6].length !== 0) {
        const forecastedDirection = data_unit[6][data_unit[4].length - 1]
        if (forecastedDirection) {
          drawDirectionArrow(forecastedDirection, ctx, "#ff9f43")
          forecastedDirectionLabel.innerHTML = forecastedDirection + "&#176;<label class='labelSmall'> voorspeld</label>"
        }
      }
    }

    const currentDirection = data_unit[4].lastMeasurement()
    if (currentDirection && !isNaN(currentDirection)) {
      drawDirectionArrow(currentDirection, ctx, "#5f27cd")
      const currentDirectionLetters = directionToLetters(currentDirection)
      currentDirectionLabel.innerHTML = currentDirection + "&#176; / " + currentDirectionLetters
    }

    directionStuffDrawn = true
  }

  //Setting numerical values (not of winddirection data, that never changes without page reload)

  if (data_unit[2].length !== 0) currentWindLabel.innerText = `${data_unit[2].lastMeasurement().replace(".", ",")} ${units[unit].afkorting}`
  if (data_unit[3].length !== 0) {
    currentGustsLabel.innerHTML = `${data_unit[3].lastMeasurement().replace(".", ",")} ${units[unit].afkorting} <label class='labelBig'>&nbsp;vlagen</label>`
  }
  if (data_unit[5]) {
    if (data_unit[5].length !== 0 && data_unit[5][data_unit[4].length - 1]) {
      forecastedWindLabel.innerHTML = `${data_unit[5][data_unit[4].length - 1].replace(".", ",")} ${units[unit].afkorting} <label class='labelSmall'> voorspeld</label>`
    }
  }

  //Setting positions

  const labels = [currentWindLabel, forecastedWindLabel, currentGustsLabel, currentDirectionLabel, forecastedDirectionLabel]

  if (currentGustsLabel.innerHTML !== "" && forecastedDirectionLabel.innerHTML !== "" && forecastedWindLabel.innerHTML !== "")
    setLabelPostitions(labels, [15, 39, 55, 79, 95])
  if (currentGustsLabel.innerHTML !== "" && forecastedDirectionLabel.innerHTML == "" && forecastedWindLabel.innerHTML == "")
    setLabelPostitions(labels, [22, 0, 50, 75, 0])
  if (currentGustsLabel.innerHTML == "" && forecastedDirectionLabel.innerHTML !== "" && forecastedWindLabel.innerHTML !== "")
    setLabelPostitions(labels, [20, 47, 0, 69, 89])
  if (currentGustsLabel.innerHTML !== "" && forecastedDirectionLabel.innerHTML == "" && forecastedWindLabel.innerHTML !== "")
    setLabelPostitions(labels, [17, 43, 63, 85, 0])
  if (currentGustsLabel.innerHTML !== "" && forecastedDirectionLabel.innerHTML !== "" && forecastedWindLabel.innerHTML == "")
    setLabelPostitions(labels, [17, 0, 45, 70, 88])
  if (currentGustsLabel.innerHTML == "" && forecastedDirectionLabel.innerHTML == "" && forecastedWindLabel.innerHTML == "")
    setLabelPostitions(labels, [38, 0, 0, 69, 0])

  const lastMeasurementTime = data_unit[1][data_unit[2].length - 1]

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