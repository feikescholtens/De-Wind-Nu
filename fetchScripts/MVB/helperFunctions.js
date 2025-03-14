export function MessageError(rawData, resolve) {
  //All fetcherrors are handled another file, these errors are when the request is successful but the data is not

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