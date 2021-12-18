const fs = require("fs");
const times = JSON.parse(fs.readFileSync("times.json"))

const {
  fetchRWS
} = require("./fetchScripts/Rijkswaterstaat");
const {
  fetchKNMI
} = require("./fetchScripts/KNMI");
const {
  fetchMVB
} = require("./fetchScripts/Meetnet Vlaamse Banken");

async function fetchData(databaseData, resolve) {

  // Rijkswaterstaat
  if (databaseData.datasets.Rijkswaterstaat) {
    fetchRWS(databaseData, resolve, times)
  }

  //KNMI
  if (databaseData.datasets.KNMI) {
    fetchKNMI(databaseData, resolve, times)
  }

  //Meetnet Vlaamse Banken
  if (databaseData.datasets.MVB) {
    fetchMVB(databaseData, resolve, times)
  }
}

module.exports = {
  fetchData
}