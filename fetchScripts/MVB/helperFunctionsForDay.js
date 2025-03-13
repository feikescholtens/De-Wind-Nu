import { addDays, isSameDay, addHours, subHours } from "date-fns"

export function giveMVBFetchOptions(dateParsed, DSTDates, databaseData, newToken) {

  const keyFetch = newToken || global.MVBAPIKey.APIKey
  const locationID = JSON.stringify(databaseData.measurements.API_ID)
  const dateStartFetch = dateParsed.toISOString()
  let dateEndFetch = addDays(dateParsed, 1)

  if (isSameDay(dateParsed, DSTDates.fromDST) && global.serverTimeZone === "UTC") dateEndFetch = addHours(dateEndFetch, 1).toISOString()
  // Check if the date requested is the day of switching from summertime to wintertime. This day contains 25 hours, and since UTC doesn't include DST, it just 
  // adds 24 hours in the addDays function above. The requested data will therefore miss 1 hour of data for the requested day.
  else if (isSameDay(dateParsed, DSTDates.toDST) && global.serverTimeZone === "UTC") dateEndFetch = subHours(dateEndFetch, 1).toISOString()
  // Check if the date requested is the day of switching from wintertime to summertime. This day contains 23 hours, and since UTC doesn't include DST, it just 
  // adds 24 hours in the addDays function above. The requested data will therefore contain 1 extra hour (of the day after) which will confuse the rest of the script and cause a bug.
  else dateEndFetch = dateEndFetch.toISOString()

  return {
    "headers": {
      "authorization": `Bearer ${keyFetch}`,
      "content-type": "application/json; charset=UTF-8"
    },
    "body": `{\"StartTime\":\"${dateStartFetch}\",\"EndTime\":\"${dateEndFetch}\",\"IDs\":${locationID}}`,
    "method": "POST"
  }
}