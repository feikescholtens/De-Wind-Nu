import {
  format,
  sub,
  parseISO,
  getUnixTime,
  parse,
  add
} from "date-fns"
import utcToZonedTime from "date-fns-tz/utcToZonedTime/index.js"
import fetch from "node-fetch";
import {
  readFileSync,
  writeFile
} from 'fs';

export async function fetchMVB(databaseData, resolve, times) {

  let data = []

  //Getting API key, if gotten, make request for data

  const MVBAPIKey = JSON.parse(readFileSync("Meetnet Vlaamse Banken API key.json"));

  if (Object.keys(MVBAPIKey).length == 0 || (getUnixTime(new Date()) + 5) > MVBAPIKey.expirationDate) {

    await fetch("https://api.meetnetvlaamsebanken.be/Token", {
        "headers": {
          "content-type": "application/x-www-form-urlencoded charset=UTF-8"
        },
        "body": `grant_type=password&username=${process.env.APP_EMAIL}&password=${process.env.MVB_PWD_ENCODED}`,
        "method": "POST"
      })
      .then(response => response.text())
      .then(async function (raw_data_text) {
        const raw_data = JSON.parse(raw_data_text)

        if (raw_data.Message) {
          if (raw_data.Message == "Login failed") {
            data = {
              error: {
                code: "LOGINFAILED"
              },
              dataset: "MVB"
            }
          }
          resolve({
            data
          })
        }

        const expiresString = add(parse(raw_data[".expires"], "EEE, dd MMM yyyy HH:mm:ss 'GMT'", new Date()), {
          hours: 1
        })
        const issuedString = add(parse(raw_data[".issued"], "EEE, dd MMM yyyy HH:mm:ss 'GMT'", new Date()), {
          hours: 1
        })

        writeFile("Meetnet Vlaamse Banken API key.json", JSON.stringify({
          "expirationDate": getUnixTime(expiresString),
          "issuedDate": getUnixTime(issuedString),
          "APIKey": raw_data["access_token"]
        }, null, 2), (err) => {
          if (err) {
            console.log(err)
            resolve({
              data
            })
          }

          fetchDataMVB(raw_data["access_token"])
        })

      })
      .catch(function (error) {
        data = {
          error: error,
          dataset: "MVB"
        }
      })

  } else {
    fetchDataMVB()
  }


  async function fetchDataMVB(newToken) {
    let keyFetch

    if (newToken) {
      keyFetch = newToken
    } else {
      keyFetch = JSON.parse(readFileSync("Meetnet Vlaamse Banken API key.json")).APIKey
    }

    const locationID = JSON.stringify(databaseData.datasets.MVB.location_id)
    const timeZone = 'Europe/Amsterdam'
    const dateUTC = new Date()
    const dateZoned = utcToZonedTime(dateUTC, timeZone)
    const dateToday = format(dateZoned, "dd-MM-yyyy")
    const dateYesterdayFetch = format(sub(dateZoned, {
      days: 1
    }), "yyyy-MM-dd")
    const dateTodayFetch = format(dateZoned, "yyyy-MM-dd")

    data = await fetch("https://api.meetnetvlaamsebanken.be/V2/getData", {
        "headers": {
          "authorization": `Bearer ${keyFetch}`,
          "content-type": "application/json; charset=UTF-8"
        },
        "body": `{\"StartTime\":\"${dateYesterdayFetch}T23:00:00.000Z\",\"EndTime\":\"${dateTodayFetch}T23:00:00.000Z\",\"IDs\":${locationID}}`,
        "method": "POST"
      })
      .then(response => response.text())
      .then(async function procesMVBData(raw_data_text) {

        const raw_data = JSON.parse(raw_data_text)
        // const raw_data = JSON.parse(fs.readFileSync("project_files/discontinuous test data MVB.json"))

        if (raw_data.Message) {
          if (raw_data.Message == "Authorization has been denied for this request.") {
            data = {
              error: {
                code: 24,
                message: "Authorization has been denied for this request."
              },
              dataset: "MVB"
            }
            resolve({
              data
            })
          }
        } else if (!raw_data.StartTime) {
          data = {
            error: {
              code: 91,
              message: "No data (yet) for this station."
            },
            dataset: "MVB"
          }
          resolve({
            data
          })
        } else {

          //Declare variables
          let wind_speed = [],
            wind_gusts = [],
            wind_direction = []

          const date = new Array(times.length).fill(dateToday)
          let timeStamps = JSON.parse(JSON.stringify(times))

          for (let i = 0; i < raw_data.Values.length; i++) {
            if (raw_data.Values[i].Values.length !== 0) {

              let measurementTimes = []
              let tempArray = []

              raw_data.Values[i].Values.forEach((value) => {
                let time = format(utcToZonedTime(parseISO(value.Timestamp), timeZone), "HH:mm")
                measurementTimes.push(time)
              })

              times.forEach((value) => {

                if (measurementTimes.includes(value)) {

                  let index = measurementTimes.indexOf(value);

                  if (raw_data.Values[i].Values[index]) {
                    if (raw_data.Values[i].Values[index].Value) {
                      tempArray.push(raw_data.Values[i].Values[index].Value)
                    } else {
                      tempArray.push(-999)
                    }
                  } else {
                    tempArray.push(-999)
                  }

                } else {
                  tempArray.push(-999)
                }
              })

              let lastMeasurementH = measurementTimes[measurementTimes.length - 1].substring(0, 2)
              let lastMeasurementm = measurementTimes[measurementTimes.length - 1].substring(3, 5)
              let theoreticalMeasurementCount = lastMeasurementH * 6 + lastMeasurementm / 10 + 1

              for (let j = 0; j < (times.length - theoreticalMeasurementCount); j++) {
                tempArray.pop(1)
              }

              if (raw_data.Values[i].ID.includes("WC3")) {
                wind_gusts = JSON.parse(JSON.stringify(tempArray)).map(x => x * 1.94384449)
              } else if (raw_data.Values[i].ID.includes("WVC")) {
                wind_speed = JSON.parse(JSON.stringify(tempArray)).map(x => x * 1.94384449)
              } else if (raw_data.Values[i].ID.includes("WRS")) {
                wind_direction = JSON.parse(JSON.stringify(tempArray))
              }
            }
          }

          timeStamps.splice(wind_speed.length)

          // Add all the data to the main array which will be returned
          data["MVB"] = [date, timeStamps, wind_speed, wind_gusts, wind_direction]
          resolve({
            data
          })
        }

        //Errors: will be sent back and handled in other function (handleFetchErrors)
      }).catch(function (error) {
        console.log(error)

        data = {
          error: error,
          dataset: "MVB"
        }
        resolve({
          data
        })
      })
  }
}