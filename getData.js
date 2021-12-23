import { handleFetchErrors } from "./handleFetchErrors.js"
import { validID, dataUseful } from "./validationFunctions.js"
import { readFileSync } from 'fs';
import { fetchRWS } from "./fetchScripts/Rijkswaterstaat.js"
import { fetchKNMI } from "./fetchScripts/KNMI.js"
import { fetchMVB } from "./fetchScripts/Meetnet Vlaamse Banken.js"

const times = JSON.parse(readFileSync("times.json"))

export async function getData(request, response, locations) {

  if (!validID(request.params.id, locations, response)) return

  const location = locations.find(location => location.id == request.params.id)

  const dataFetched = await new Promise(async (resolve) => {

    // Rijkswaterstaat
    if (location.datasets.Rijkswaterstaat) {
      return fetchRWS(location, resolve, times)
    }

    //KNMI
    if (location.datasets.KNMI) {
      return fetchKNMI(location, resolve, times)
    }

    //Meetnet Vlaamse Banken
    if (location.datasets.MVB) {
      return fetchMVB(location, resolve, times)
    }
  });

  if (dataFetched.data.error) {
    handleFetchErrors(dataFetched, response)
    return
  }

  dataFetched.name = location.name;
  const dataset = Object.keys(dataFetched.data)[0]

  if (!dataUseful(dataFetched, dataset, response)) return

  return {
    values: dataFetched.data[dataset],
    spotName: dataFetched.name,
    dataset: dataset
  };
}