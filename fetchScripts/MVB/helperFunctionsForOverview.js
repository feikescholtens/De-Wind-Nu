export function giveMVBOverviewFetchOptions(locationsArray, newToken) {

  const keyFetch = newToken || global.MVBAPIKey.APIKey
  return {
    "headers": {
      "authorization": `Bearer ${keyFetch}`,
      "content-type": "application/json; charset=UTF-8"
    },
    "body": `{
          "IDs": ${JSON.stringify(locationsArray)}
        }`,
    "method": "POST"
  }

}