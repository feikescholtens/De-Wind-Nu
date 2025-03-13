export function MessageError(rawData, resolve) {
  //All fetcherrors are handled in logFetchErrors in serverFunctions.js

  if (rawData.Message) {
    log(`Meetnet Vlaamse Banken API "Message"-error: ${rawData.Message}`, "error", true)

    resolve({
      data: {
        "MVB": [
          [],
          [],
          []
        ]
      }
    })

    return true
  }

  return false
}