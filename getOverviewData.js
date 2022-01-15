import { overviewFetchRWS } from "./fetchScripts/getOverviewData/Rijkswaterstaat.js"
import { overviewFetchKNMI } from "./fetchScripts/getOverviewData/KNMI.js"
import { overviewFetchMVB } from "./fetchScripts/getOverviewData/MVB.js"

export async function getOverviewData(request, response, locations) {
  const dataSource = request.params.dataSource
  const validSources = ["Rijkswaterstaat", "KNMI", "MVB"]

  if (!validSources.includes(dataSource)) {
    response.status(404).json()
    return
  }

  const dataFetched = await new Promise(async (resolve) => {
    if (dataSource == "Rijkswaterstaat") return overviewFetchRWS(locations, resolve)
    if (dataSource == "KNMI") return overviewFetchKNMI(locations, resolve)
    if (dataSource == "MVB") return overviewFetchMVB(locations, resolve)
  })

  response.json(dataFetched)
}