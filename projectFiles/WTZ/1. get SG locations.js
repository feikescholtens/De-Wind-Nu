//Paste in console of https://waterberichtgeving.rws.nl/wbviewer/wtz_viewer.php

const select = document.getElementsByName("loc_1")[0]
const optionElements = Array.from(select.getElementsByTagName("option"))
const locations = []
optionElements.forEach((option) => {
  locations.push(option.value)
})

console.log(JSON.stringify(locations))