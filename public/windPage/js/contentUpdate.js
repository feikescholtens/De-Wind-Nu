import { updateCurrentWind } from "./updateDisplayCurrentWind.js"
import { convertToBft } from "./convertToBft.js"

import { updateGraphs, updateTable } from "./graphOrTableUpdate.js"

export async function contentUpdate() {

  const unitSelector = document.querySelector("[data-unit]")
  globalThis.unit = localStorage.getItem("unit")
  if (unitSelector.value == 4) globalThis.decimals = 0
  else globalThis.decimals = localStorage.getItem("decimals")
  globalThis.interpolation = localStorage.getItem("interpolation")

  //This 'backup' is restored to the original 'data' variable so interpolation setting can change on the fly
  const data_before_interpolation = data.copy()

  for (let j = 2; j < 6 + 1; j++) {
    if (data[j]) {
      for (let k = 0; k < times.length; k++) {
        if (data[j][k] < 0) {
          if (interpolation == "1") {

            if (j == 2 || j == 3 || j == 4) {
              const interpolatedValue = interpolatedData[j - 2].filter(element => element.index == k)[0].value

              if (j == 2 || j == 3) data[j][k] = interpolatedValue
              if (j == 4) data[j][k] = interpolatedValue

            } else data[j][k] = undefined

          } else data[j][k] = undefined
        }
      }
    }
  }

  if (parseInt(unit) !== 4) {

    for (let i = 0; i < data_unit[2].length; i++) {
      if (data_unit[2][i]) data_unit[2][i] = (units[unit].factor * data[2][i]).toFixed(decimals)
    }

    if (data_unit[3].length !== 0) {
      for (let i = 0; i < data_unit[3].length; i++) {
        if (data_unit[3][i]) data_unit[3][i] = (units[unit].factor * data[3][i]).toFixed(decimals)
      }
    }

    if (data_unit[5]) {
      for (let i = 0; i < data_unit[5].length; i++) {
        if (data_unit[5][i]) data_unit[5][i] = (units[unit].factor * data[5][i]).toFixed(decimals)
      }
    }

  } else if (parseInt(unit) == 4) {

    //The 1 * is to convert undefined to NaN to prevent raising an error message

    for (let i = 0; i < data_unit[2].length; i++) {
      if (data_unit[2][i]) data_unit[2][i] = (1 * data[2][i]).toFixed(decimals)
    }

    if (data_unit[3].length !== 0) {
      for (let i = 0; i < data_unit[3].length; i++) {
        if (data_unit[3][i]) data_unit[3][i] = (1 * data[3][i]).toFixed(decimals)
      }
    }

    if (data_unit[5]) {
      for (let i = 0; i < data_unit[5].length; i++) {
        if (data_unit[5][i]) data_unit[5][i] = (1 * data[5][i]).toFixed(decimals)
      }
    }

    convertToBft(data, data_unit)
  }

  if (data_unit[4].length !== 0) {
    for (let i = 0; i < data_unit[4].length; i++) {
      if (data_unit[4][i]) data_unit[4][i] = (1 * data[4][i]).toFixed(0)
    }
  }

  updateCurrentWind()

  if (localStorage.getItem("dataForm") == "0") updateGraphs()
  if (localStorage.getItem("dataForm") == "1") updateTable()

  data = data_before_interpolation.copy()

}