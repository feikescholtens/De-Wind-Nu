import { format, sub, parseISO, getUnixTime, parse, add } from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
import fetch from "node-fetch";
import { readFileSync, writeFile } from 'fs';

export async function fetchMVB(databaseData, resolve, times) {

  let data = []

  //Getting API key, if gotten, make request for data
  const MVBAPIKey = JSON.parse(readFileSync("Meetnet Vlaamse Banken API key.json"));

  if (Object.keys(MVBAPIKey).length == 0 || (getUnixTime(new Date()) + 5) > MVBAPIKey.expirationDate) {

    const rawDataString = await fetch("https://api.meetnetvlaamsebanken.be/Token", {
      "headers": {
        "content-type": "application/x-www-form-urlencoded charset=UTF-8"
      },
      "body": `grant_type=password&username=${process.env.APP_EMAIL}&password=${process.env.MVB_PWD_ENCODED}`,
      "method": "POST"
    }).then(response => response.text()).catch((error) => {
      data = { error: error, dataset: "MVB" }
      resolve({ data })
    })

    const rawData = JSON.parse(rawDataString)

    if (rawData.Message) {
      if (rawData.Message == "Login failed") {
        data = {
          error: {
            code: "LOGINFAILED"
          },
          dataset: "MVB"
        }
      }
      resolve({ data })
    }

    const expiresString = add(parse(rawData[".expires"], "EEE, dd MMM yyyy HH:mm:ss 'GMT'", new Date()), { hours: 1 })
    const issuedString = add(parse(rawData[".issued"], "EEE, dd MMM yyyy HH:mm:ss 'GMT'", new Date()), { hours: 1 })

    fetchDataMVB(rawData["access_token"])

    writeFile("Meetnet Vlaamse Banken API key.json", JSON.stringify({
      "expirationDate": getUnixTime(expiresString),
      "issuedDate": getUnixTime(issuedString),
      "APIKey": rawData["access_token"]
    }, null, 2), (err) => {
      if (err) {
        console.log(err)
        resolve({ data })
      }
    })

  } else {
    fetchDataMVB()
  }

  async function fetchDataMVB(newToken) {

    const keyFetch = newToken || JSON.parse(readFileSync("Meetnet Vlaamse Banken API key.json")).APIKey
    const locationID = JSON.stringify(databaseData.datasets.MVB.location_id)
    const timeZone = 'Europe/Amsterdam'
    const dateUTC = new Date()
    const dateZoned = utcToZonedTime(dateUTC, timeZone)
    const dateToday = format(dateZoned, "dd-MM-yyyy")
    const dateYesterdayFetch = format(sub(dateZoned, {
      days: 1
    }), "yyyy-MM-dd")
    const dateTodayFetch = format(dateZoned, "yyyy-MM-dd")

    const rawDataString = await fetch("https://api.meetnetvlaamsebanken.be/V2/getData", {
        "headers": {
          "authorization": `Bearer ${keyFetch}`,
          "content-type": "application/json; charset=UTF-8"
        },
        "body": `{\"StartTime\":\"${dateYesterdayFetch}T23:00:00.000Z\",\"EndTime\":\"${dateTodayFetch}T23:00:00.000Z\",\"IDs\":${locationID}}`,
        "method": "POST"
      })
      .then(response => response.text()).catch((error) => {
        // console.log(error)

        data = { error: error, dataset: "MVB" }
        resolve({ data })
      })

    let rawData
    try { rawData = JSON.parse(rawDataString) } catch { return }

    // const rawData = JSON.parse(fs.readFileSync("project_files/discontinuous test data MVB.json"))

    if (rawData.Message) {
      if (rawData.Message == "Authorization has been denied for this request.") {
        data = {
          error: { code: 24, message: "Authorization has been denied for this request." },
          dataset: "MVB"
        }
        resolve({ data })
      }
      return
    }
    if (!rawData.StartTime) {
      data = {
        error: { code: 91, message: "No data (yet) for this station." },
        dataset: "MVB"
      }
      resolve({ data })
      return
    }

    //Declare variables
    let wind_speed = [],
      wind_gusts = [],
      wind_direction = []
    const date = new Array(times.length).fill(dateToday)
    const timeStamps = JSON.parse(JSON.stringify(times))

    rawData.Values.forEach((measurementType) => {
      if (measurementType.Values.length == 0) return

      let measurementTimes = []
      let tempArray = []

      measurementType.Values.forEach((measurement) => {
        let time = format(utcToZonedTime(parseISO(measurement.Timestamp), timeZone), "HH:mm")
        measurementTimes.push(time)
      })

      times.forEach((timeStamp) => {
        if (!measurementTimes.includes(timeStamp)) {
          tempArray.push(-999)
          return
        }

        const indexTime = measurementTimes.indexOf(timeStamp);

        if (measurementType.Values[indexTime]) {
          if (measurementType.Values[indexTime].Value) {
            tempArray.push(measurementType.Values[indexTime].Value)
          } else {
            tempArray.push(-999)
          }
        } else {
          tempArray.push(-999)
        }
      })

      const lastMeasurementHH = measurementTimes[measurementTimes.length - 1].substring(0, 2)
      const lastMeasurementmm = measurementTimes[measurementTimes.length - 1].substring(3, 5)
      const theoreticalMeasurementCount = lastMeasurementHH * 6 + lastMeasurementmm / 10 + 1

      for (let j = 0; j < (times.length - theoreticalMeasurementCount); j++) {
        tempArray.pop()
      }

      if (measurementType.ID.includes("WC3")) {
        wind_gusts = JSON.parse(JSON.stringify(tempArray)).map(x => x * 1.94384449)
      } else if (measurementType.ID.includes("WVC")) {
        wind_speed = JSON.parse(JSON.stringify(tempArray)).map(x => x * 1.94384449)
      } else if (measurementType.ID.includes("WRS")) {
        wind_direction = JSON.parse(JSON.stringify(tempArray))
      }
    })

    timeStamps.splice(wind_speed.length)

    // Add all the data to the main array which will be returned
    data["MVB"] = [date, timeStamps, wind_speed, wind_gusts, wind_direction]
    resolve({ data })
  }
}