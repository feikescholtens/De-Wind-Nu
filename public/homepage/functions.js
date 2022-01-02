const tilesObjects = await fetch("./OSMTiles.json").then(response => response.json())

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