import { logFetchErrors } from "./logFetchErrors.js"
import { overviewFetchVLINDER } from "./fetchScripts/getOverviewData/VLINDER.js"
import { overviewFetchRWS } from "./fetchScripts/getOverviewData/Rijkswaterstaat.js"
import { overviewFetchKNMI } from "./fetchScripts/getOverviewData/KNMI.js"
import { overviewFetchMVB } from "./fetchScripts/getOverviewData/MVB.js"

export async function getOverviewData(request, response, locations) {

  const dataSource = request.params.dataSource
  const validSources = ["VLINDER", "Rijkswaterstaat", "KNMI", "MVB"]

  if (!validSources.includes(dataSource)) {
    response.status(404).json()
    return
  }

  const dataFetched = await new Promise(async (resolve) => {
    if (dataSource == "VLINDER") return overviewFetchVLINDER(locations, resolve)
    if (dataSource == "Rijkswaterstaat") return overviewFetchRWS(locations, resolve)
    if (dataSource == "KNMI") return overviewFetchKNMI(locations, resolve)
    if (dataSource == "MVB") return overviewFetchMVB(locations, resolve)
  })

  if (dataFetched.data) {
    if (dataFetched.data.error) {
      logFetchErrors(dataFetched, response)
    }
  }

  response.json(dataFetched)
}