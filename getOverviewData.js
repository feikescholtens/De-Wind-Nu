import { logFetchErrors } from "./fetchScripts/fetchUtilFunctions.js"
import { fetchDataForOverview_VLINDER } from "./fetchScripts/VLINDER/fetchDataForOverview.js"
import { fetchDataForOverview_RWS } from "./fetchScripts/RWS/fetchDataForOverview.js"
import { fetchDataForOverview_KNMI } from "./fetchScripts/KNMI/fetchDataForOverview.js"
import { fetchDataForOverview_MVB } from "./fetchScripts/MVB/fetchDataForOverview.js"

export async function getOverviewData(request, response, locations) {

  const dataSource = request.params.dataSource
  const validSources = ["VLINDER", "RWS", "KNMI", "MVB"]

  if (!validSources.includes(dataSource)) {
    response.status(404).json()
    return
  }

  const dataFetched = await new Promise(async (resolve) => {
    if (dataSource == "VLINDER") return fetchDataForOverview_VLINDER(locations, resolve)
    if (dataSource == "RWS") return fetchDataForOverview_RWS(locations, resolve)
    if (dataSource == "KNMI") return fetchDataForOverview_KNMI(locations, resolve)
    if (dataSource == "MVB") return fetchDataForOverview_MVB(locations, resolve)
  })

  if (dataFetched.data) {
    if (dataFetched.data.error) {
      logFetchErrors(dataFetched, response)
    }
  }

  response.json(dataFetched)
}