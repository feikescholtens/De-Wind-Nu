async function fetchData(database_data, moment, MVBAPIKey, resolve, reject, fs) {
  //Import the needed modules
  const fetch = (...args) => import('node-fetch').then(({
    default: fetch
  }) => fetch(...args))


  //data is the variable that is gonna be sent back
  let data = []

  // Rijkswaterstaat
  if (database_data.datasets.Rijkswaterstaat) {
    const loc_id_RWS = database_data.datasets.Rijkswaterstaat.location_id

    //Rijkswaterstaat uses different timezone
    const dateRWS_b = moment().tz("Europe/Amsterdam").subtract(1, 'days').startOf('day').format("YYYY-MM-DD")
    const dateRWS_e = moment().tz("Europe/Amsterdam").format("YYYY-MM-DD")
    const DST = moment().tz("Europe/Amsterdam").subtract(1, 'days').startOf('day').isDST()
    let time_be

    if (DST == false) {
      //Het is wintertijd
      time_be = "23:00:00"
    } else {
      //Het is zomertijd
      time_be = "22:00:00"
    }

    await fetch(`https://waterberichtgeving.rws.nl/wbviewer/wb_api.php?request=windrose&meting=WN_S_1.2-5&verwachting=WN_knmi_6.1-2&loc=${loc_id_RWS}&start=${dateRWS_b}T${time_be}Z&end=${dateRWS_e}T${time_be}Z`)
      .then(response => response.text())
      .then(function (raw_data_text) {

        const raw_data = JSON.parse(raw_data_text)

        //Declare variables and set option for moment
        let date = [],
          time = [],
          wind_speed = [],
          wind_gusts = [],
          wind_direction = [],
          wind_speedFOR = [],
          wind_directionFOR = []
        let null_counter = [0, 0, 0]
        const null_treshold = 5
        let iLastMeasurement
        moment.locale("nl")

        for (iLastMeasurement = raw_data.meting.values.length - 1; iLastMeasurement >= 0; iLastMeasurement--) {
          if (raw_data.meting.values[iLastMeasurement][0] !== null) {
            iLastMeasurement++
            break
          }
        }

        //Loop again but this time only through the values that are defined
        for (let i = 0; i < iLastMeasurement; i++) {

          //Set the date and time arrays
          time[i] = moment.unix(raw_data.meting.times[i]).tz("Europe/Amsterdam").format("HH:mm")

          //Check for wind, wind gusts and direction if the value is null, if so, add to the array which counts the null values
          if (raw_data.meting.values[i][2] == null) {
            null_counter[0]++
          }
          if (raw_data.meting.values[i][3] == null) {
            null_counter[1]++
          }
          if (raw_data.meting.values[i][0] == null) {
            null_counter[2]++
          }
        }

        //Loop for wind, wind gusts and direction (3 times, length of array null_counter)
        for (let k = 0; k < null_counter.length; k++) {

          //If the there are less null values in each array, good. Else the data is not considered good enough and the array remains empty
          if (null_counter[k] < null_treshold) {

            //Loop through all the data and add to the arrays (*10 for the right decimals place and *1.94 for the factor to knots)
            for (let i = 0; i < iLastMeasurement; i++) {
              if (k == 0) {

                //If value is null, set it in the array as the previous value
                if (raw_data.meting.values[i][2] == null) {
                  if (wind_speed[i - 1]) {
                    wind_speed[i] = wind_speed[i - 1]
                  } else {
                    wind_speed[i] = ""
                  }
                } else {
                  wind_speed[i] = (raw_data.meting.values[i][2] / 10 * 1.94384449)
                }
              }
              if (k == 1) {

                //If value is null, set it in the array as the previous value
                if (raw_data.meting.values[i][3] == null) {
                  if (wind_gusts[i - 1]) {
                    wind_gusts[i] = wind_speed[i - 1]
                  } else {
                    wind_gusts[i] = ""
                  }
                } else {
                  wind_gusts[i] = (raw_data.meting.values[i][3] / 10 * 1.94384449)
                }
              }
              if (k == 2) {

                //If value is null, set it in the array as the previous value
                if (raw_data.meting.values[i][0] == null) {
                  if (wind_direction[i - 1]) {
                    wind_direction[i] = wind_speed[i - 1]
                  } else {
                    wind_direction[i] = ""
                  }
                } else {
                  wind_direction[i] = raw_data.meting.values[i][0]
                }
              }
            }
          }
        }

        //Loop through all the values in the verwachtingen key, these will most likely be not equal to null
        for (let l = 0; l < raw_data.verwachting.values.length; l++) {

          //Add date for every timestamp of the day to the date array
          date[l] = moment.unix(raw_data.meting.times[l]).tz("Europe/Amsterdam").format("L")

          //Wind Speed
          if (raw_data.verwachting.values[l][0] !== null) {
            wind_speedFOR[l] = raw_data.verwachting.values[l][0] / 10 * 1.94384449
          } else if (wind_speedFOR[l - 1]) {
            wind_speedFOR[l] = wind_speedFOR[l - 1]
          } else {
            wind_speedFOR[l] = ""
          }

          //Wind Direction
          if (raw_data.verwachting.values[l][1] !== null) {
            wind_directionFOR[l] = raw_data.verwachting.values[l][1]
          } else if (wind_directionFOR[l - 1]) {
            wind_directionFOR[l] = wind_directionFOR[l - 1]
          } else {
            wind_directionFOR[l] = ""
          }
        }

        //Add all the data to the main array which will be returned
        data["Rijkswaterstaat"] = [date, time, wind_speed, wind_gusts, wind_direction, wind_speedFOR, wind_directionFOR]
        resolve({
          data
        })

        //Errors: will be sent back and handled in other function (handleFetchErrors)
      }).catch(function (error) {
        data = {
          error: error,
          dataset: "Rijkswaterstaat"
        }
        resolve({
          data
        })
      })
  }

  //KNMI
  if (database_data.datasets.KNMI) {
    //Declare variables for fetching
    const dateKNMI = moment().tz("Europe/Amsterdam").format("YYYY-M-D")

    let loc_id_KNMI = database_data.datasets.KNMI.location_id

    await fetch(`https://graphdata.buienradar.nl/1.0/actualarchive/weatherstation/${loc_id_KNMI}/?startDate=${dateKNMI}`, {})
      .then(response => response.text())
      .then(function (raw_data_text) {

        const raw_data = JSON.parse(raw_data_text)

        //Declare variables
        let date = [],
          time = [],
          wind_speed = [],
          wind_gusts = [],
          wind_direction = []
        let null_counter = [0, 0, 0]
        const null_treshold = 5

        //Loop through the data
        for (var i = 0; i < raw_data.observations.length; i++) {

          //Set the date and time arrays (data needs to be reformatted to Dutch)
          date[i] = raw_data.observations[i].datetime.split("T")[0].substring(8, 10) + "-" + raw_data.observations[i].datetime.split("T")[0].substring(5, 7) + "-" + raw_data.observations[i].datetime.split("T")[0].substring(0, 4)
          time[i] = raw_data.observations[i].datetime.split("T")[1].substring(0, 5)

          //Check for wind, wind gusts and direction if the value is null, if so, add to the array which counts the null values
          if (raw_data.observations[i].values.ff == null) {
            null_counter[0]++
          }
          if (raw_data.observations[i].values.fx == null) {
            null_counter[1]++
          }
          if (raw_data.observations[i].values.dd == null) {
            null_counter[2]++
          }
        }

        //Loop for wind, wind gusts and direction (3 times, length of array null_counter)
        for (let k = 0; k < null_counter.length; k++) {

          //If the there are less null values in each array, good. Else the data is not considered good enough and the array remains empty
          if (null_counter[k] < null_treshold) {

            //Loop through all the data and add to the arrays (*0.53 for the factor to knots)
            for (let i = 0; i < raw_data.observations.length; i++) {
              if (k == 0) {
                wind_speed[i] = raw_data.observations[i].values.ff * 0.53995726994149
              }
              if (k == 1) {
                wind_gusts[i] = raw_data.observations[i].values.fx * 0.53995726994149
              }
              if (k == 2) {
                wind_direction[i] = raw_data.observations[i].values.dd
              }
            }
          }
        }

        //Add all the data to the main array which will be returned
        data["KNMI"] = [date, time, wind_speed, wind_gusts, wind_direction]
        resolve({
          data
        })
        //Errors: will be sent back and handled in other function (handleFetchErrors)
      }).catch(function (error) {
        data = {
          error: error,
          dataset: "KNMI"
        }
        resolve({
          data
        })
      })
  }

  //Meetnet Vlaamse Banken
  if (database_data.datasets.MVB) {

    //MVB uses different timezone
    const dateMVB_b = moment().tz("Europe/Amsterdam").subtract(1, 'days').startOf('day').format("YYYY-MM-DD")
    const dateMVB_e = moment().tz("Europe/Amsterdam").format("YYYY-MM-DD")
    const DST = moment().tz("Europe/Amsterdam").subtract(1, 'days').startOf('day').isDST()
    let time_be

    if (DST == false) {
      //Het is wintertijd
      time_be = "23:00:00"
    } else {
      //Het is zomertijd
      time_be = "22:00:00"
    }

    //Getting API key, if gotten, make request for data
    if (Object.keys(MVBAPIKey).length == 0 || (moment().unix() + 5) > MVBAPIKey.expirationDate) {
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
            return
          }

          fs.writeFile("Meetnet Vlaamse Banken API key.json", JSON.stringify({
            "expirationDate": moment.utc(raw_data[".expires"]).unix(),
            "issuedDate": moment.utc(raw_data[".issued"]).unix(),
            "APIKey": raw_data["access_token"]
          }, null, 2), (err) => {
            if (err) {
              console.log(err)
              return
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
        keyFetch = JSON.parse(fs.readFileSync("Meetnet Vlaamse Banken API key.json")).APIKey
      }

      //Declare variables for fetching
      const loc_id_MVB = JSON.stringify(database_data.datasets.MVB.location_id)

      data = await fetch("https://api.meetnetvlaamsebanken.be/V2/getData", {
          "headers": {
            "authorization": `Bearer ${keyFetch}`,
            "content-type": "application/json; charset=UTF-8"
          },
          "body": `{\"StartTime\":\"${dateMVB_b}T${time_be}.000Z\",\"EndTime\":\"${dateMVB_e}T${time_be}.000Z\",\"IDs\":${loc_id_MVB}}`,
          "method": "POST"
        })
        .then(response => response.text())
        .then(async function procesMVBData(raw_data_text) {

          const raw_data = JSON.parse(raw_data_text)
          // const raw_data = JSON.parse(fs.readFileSync("project_files/discontinuous test data MVB.json"))

          if (raw_data.Message) {
            if (raw_data.Message == "Authorization has been denied for this request.") {
              data = {
                error: "Error: Authorization has been denied for this request.",
                dataset: "MVB"
              }
            }
          } else {
            const times = JSON.parse(fs.readFileSync("times.json"))

            //Declare variables
            let wind_speed = [],
              wind_gusts = [],
              wind_direction = []

            const date = new Array(times.length).fill(moment(raw_data.Values[0].Values[raw_data.Values[0].Values.length - 1]).tz("Europe/Amsterdam").format("DD-MM-YYYY"))
            let timeStamps = JSON.parse(JSON.stringify(times))

            for (let i = 0; i < raw_data.Values.length; i++) {
              let measurementTimes = []
              let tempArray = []

              raw_data.Values[i].Values.forEach((value) => {
                let time = moment(value.Timestamp).tz("Europe/Amsterdam").format("HH:mm")
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

              console.log(tempArray)
              let lastMeasurementH = moment(raw_data.Values[i].Values[raw_data.Values[i].Values.length - 1].Timestamp).tz("Europe/Amsterdam").format("HH")
              let lastMeasurementm = moment(raw_data.Values[i].Values[raw_data.Values[i].Values.length - 1].Timestamp).tz("Europe/Amsterdam").format("mm")
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
}

module.exports = {
  fetchData
}