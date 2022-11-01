//Paste in console of https://waterberichtgeving.rws.nl/wbviewer/zoek_wtz.php?zoek=locaties

const table = document.querySelector("table")
const locations = []
const locationsRows = table.getElementsByTagName("tr")
for (let i = 0; i < locationsRows.length; i++) {
  let ID = locationsRows[i].children[0].innerText


}