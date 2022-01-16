globalThis.units = await fetch("./wind/json/units.json").then(response => response.json())

export function fitMap(map, markersLats, markersLons) {
  map.fitBounds([
    [markersLons.at(-1), markersLats[0]], // southwestern corner of the bounds
    [markersLons[0], markersLats.at(-1)] // northeastern corner of the bounds
  ], {
    padding: 40
  })
}

function setLocURL(map) {
  const precisePosition = [map.getCenter().lng, map.getCenter().lat, map.getZoom()]
  history.replaceState({}, "De Wind Nu", `?x=${precisePosition[0]}&y=${precisePosition[1]}&z=${precisePosition[2]}`)
}

export function windPage(id, map) {
  setLocURL(map)
  window.location.assign(`${window.location.protocol}//${window.location.host}/wind/${id}`)
}

export function changeTiles(map, tilesSelector, seaMapCheckbox) {

  let value
  if (seaMapCheckbox.checked == false) {
    value = "0"
  } else {
    value = "1"
  }

  localStorage.setItem("tiles", tilesSelector.value)
  localStorage.setItem("seaMap", value)

  setLocURL(map)
  location.reload()
}

export function setOverviewData(data) {
  Object.keys(data).forEach(locationID => {
    const dataSourceClass = document.getElementById(locationID).classList[1]

    const arrow = document.createElement("div")
    arrow.classList.add("arrowArm")
    arrow.classList.add(dataSourceClass)

    if (data[locationID]) {
      arrow.style.transform = `translateX(calc(-0.3 * var(--markerSize))) rotate(${data[locationID].wind_direction}deg)`

      if (!data[locationID].wind_speed) return
      const wind_speedBft = convertValueToBft(parseInt(data[locationID].wind_speed.toFixed(0)))
      document.getElementById(locationID).innerText = wind_speedBft
    }

    document.getElementById(locationID).parentNode.prepend(arrow)
  })
}

function convertValueToBft(value) {

  //Check first extreme: windforce 0
  if (value < units[4].ranges[0]) {
    return "0"
  }

  //Loop through every windforce and check if the value falls into that category
  for (let j = 0; j < (units[4].ranges.length - 2); j++) {
    if ((value >= units[4].ranges[j]) && (value < units[4].ranges[j + 1])) {
      return (j + 1).toString()
    }
  }

  //Check second extreme: windforce 12
  if (value >= units[4].ranges[11]) {
    return "12"
  }

}