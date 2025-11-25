import { addDays, subDays, isSameDay, add, sub, addHours } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"








export function giveRWSFetchOptions(dateParsed, databaseData, DSTDates) {

  let [startTime, endTime, dateStartFetch, dateEndFetch] = getRWSFetchDates(dateParsed, DSTDates)
  const locationID = databaseData.measurements.API_ID
  const locationX = databaseData.measurements.API_Coordinates[0]
  const locationY = databaseData.measurements.API_Coordinates[1]

  return {
    "headers": {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    "body": JSON.stringify({
      "AquoPlusWaarnemingMetadata": {
        "AquoMetadata": {
          "Compartiment": { "Code": "LT" }
        }
      },
      "Locatie": { "X": locationX, "Y": locationY, "Code": `${locationID}` },
      "Periode": {
        "Begindatumtijd": `${dateStartFetch}T${startTime}.000+01:00`,
        "Einddatumtijd": `${dateEndFetch}T${endTime}.000+01:00`
      }
    }),
    "method": "POST"
  }

}













function getRWSFetchDates(dateParsed, DSTDates) {
  // Update 12 march 2025: looked at this to make this less of a hassle, but the conclusion was that the standard RWS uses is still 

  let startTime, endTime, dateStartFetch, dateEndFetch

  if (dateParsed > DSTDates.toDST && dateParsed < DSTDates.fromDST) {
    // Summertime
    startTime = endTime = "22:00:00"

    dateStartFetch = subDays(dateParsed, 1)
    if (isSameDay(dateStartFetch, DSTDates.toDST) && dateStartFetch.getHours() === 22) dateStartFetch = addHours(dateStartFetch, 1)
    dateStartFetch = formatInTimeZone(dateStartFetch, global.userTimeZone, "yyyy-MM-dd")
    //Explaination for above: if the system is using UTC timezone, subDays will subtract 24 hours instead of 23. This is because UTC doesn't use DST.
    //Because of this, the format function doesn't pick the right day

    dateEndFetch = formatInTimeZone(dateParsed, global.userTimeZone, "yyyy-MM-dd")
  } else if (isSameDay(dateParsed, DSTDates.toDST)) {
    //Day of going to summertime
    startTime = "00:00:00"
    endTime = "22:00:00"
    dateStartFetch = dateEndFetch = formatInTimeZone(dateParsed, global.userTimeZone, "yyyy-MM-dd")
  } else if (isSameDay(dateParsed, DSTDates.fromDST)) {
    //Day of going to wintertime
    startTime = "22:00:00"
    endTime = "00:00:00"
    dateStartFetch = formatInTimeZone(sub(dateParsed, { days: 1 }), global.userTimeZone, "yyyy-MM-dd")
    dateEndFetch = formatInTimeZone(add(dateParsed, { days: 1, hours: 2 }), global.userTimeZone, "yyyy-MM-dd")
  } else {
    //Wintertime
    startTime = endTime = "00:00:00"
    dateStartFetch = formatInTimeZone(dateParsed, global.userTimeZone, "yyyy-MM-dd")
    dateEndFetch = formatInTimeZone(addDays(dateParsed, 1), global.userTimeZone, "yyyy-MM-dd")
  }
  //All above is needed due to *** RWS API
  return [startTime, endTime, dateStartFetch, dateEndFetch]

}