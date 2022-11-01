import { updateCurrentWind } from "./updateDisplayCurrentWind.js"
import { convertToBft } from "./convertToBft.js"
import { updateGraphs, updateTable } from "./graphOrTableUpdate.js"

export async function contentUpdate() {

  //(This 'backup' is restored to the original 'data' variable so interpolation setting can change on the fly)
  const dataBeforeInterpolation = data.copy()

  //Put interolated data into the arrays if requested
  const dataTypeArray = ["windSpeed", "windGusts", "windDirection"]
  dataTypeArray.forEach(dataType => {
    if (data[dataType] || data[dataType] == 0) {
      for (let k = 0; k < data[dataType].length; k++) {
        if (data[dataType][k] < 0 || isNaN(data[dataType][k])) { //Also checking for NaN's because of data is already loaded, negative values are replaced with NaN
          if (interpolation == "1") {
            data[dataType][k] = interpolatedData[dataType].filter(element => element.index == k)[0].value
          } else data[dataType][k] = undefined
        }
      }
    }
  })

  //Converting arrays to have correct units
  const arrays = ["windSpeed", "windGusts", "windDirection", "windSpeedForecast", "windGustsForecast", "windDirectionForecast"]
  const arraysUnitChange = ["windSpeed", "windGusts", "windSpeedForecast", "windGustsForecast"]
  const arraysNoUnitChange = ["windDirection", "windDirectionForecast"]
  const arraysAlways0Decimal = ["windDirection", "windDirectionForecast"]
  //Upper arrays and approach below is more general and allows for easily adding more dataTypes in the future :-)

  arrays.forEach(dataType => {
    if (dataWUnits[dataType] && dataWUnits[dataType].length !== 0) {
      for (let i = 0; i < dataWUnits[dataType].length; i++) {

        if (dataWUnits[dataType][i] || dataWUnits[dataType][i] == 0) {

          //Unit needs to be changed
          if (arraysUnitChange.includes(dataType)) {
            if (arraysAlways0Decimal.includes(dataType))
              dataWUnits[dataType][i] = (units[unit].factor * data[dataType][i]).toFixed(0)
            else
              dataWUnits[dataType][i] = (units[unit].factor * data[dataType][i]).toFixed(decimals)
          }

          //Unit does't need to be changed (the * 1 needs to happen to let undefined become NaN)
          if (arraysNoUnitChange.includes(dataType)) {
            if (arraysAlways0Decimal.includes(dataType))
              dataWUnits[dataType][i] = (1 * data[dataType][i]).toFixed(0)
            else
              dataWUnits[dataType][i] = (1 * data[dataType][i]).toFixed(decimals)
          }
        }
      }
    }
  })

  if (unit == "Bft") convertToBft(data, dataWUnits)

  //
  if (dataWUnits.windSpeed.length !== 0 || dataWUnits.windGusts.length !== 0 || dataWUnits.windDirection.length !== 0) updateCurrentWind()

  if (localStorage.getItem("dataForm") == "graphs") updateGraphs()
  if (localStorage.getItem("dataForm") == "table") updateTable()

  data = dataBeforeInterpolation.copy()

}