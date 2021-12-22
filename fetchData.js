import {
  readFileSync
} from 'fs';
import {
  fetchRWS
} from "./fetchScripts/Rijkswaterstaat.js"
import {
  fetchKNMI
} from "./fetchScripts/KNMI.js"
import {
  fetchMVB
} from "./fetchScripts/Meetnet Vlaamse Banken.js"

const times = JSON.parse(readFileSync("times.json"))

export async function fetchData(databaseData, resolve) {

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