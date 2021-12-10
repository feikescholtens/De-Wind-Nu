async function fetchData(database_data, moment, MVBAPIKey, resolve, reject, fs) {
  //Import the needed modules
  const fetch = (...args) => import('node-fetch').then(({
    default: fetch
  }) => fetch(...args));


  //data is the variable that is gonna be sent back
  let data = [];

  // Rijkswaterstaat
  if (database_data.datasets.Rijkswaterstaat) {
    const loc_id_RWS = database_data.datasets.Rijkswaterstaat.location_id;

    //Rijkswaterstaat uses different timezone
    const dateRWS_b = moment().tz("Europe/Amsterdam").subtract(1, 'days').startOf('day').format("YYYY-MM-DD");
    const dateRWS_e = moment().tz("Europe/Amsterdam").format("YYYY-MM-DD");
    const DST = moment().tz("Europe/Amsterdam").subtract(1, 'days').startOf('day').isDST();
    let time_be;

    if (DST == false) {
      //Het is wintertijd
      time_be = "23:00:00";
    } else {
      //Het is zomertijd
      time_be = "22:00:00";
    }

    await fetch(`https://waterberichtgeving.rws.nl/wbviewer/wb_api.php?request=windrose&meting=WN_S_1.2-5&verwachting=WN_knmi_6.1-2&loc=${loc_id_RWS}&start=${dateRWS_b}T${time_be}Z&end=${dateRWS_e}T${time_be}Z`)
      .then(response => response.text())
      .then(function (raw_data_text) {

        const raw_data = JSON.parse(raw_data_text);

        //Declare variables and set option for moment
        let date = [],
          time = [],
          wind_speed = [],
          wind_gusts = [],
          wind_direction = [],
          wind_speedFOR = [],
          wind_directionFOR = [];
        let null_counter = [0, 0, 0];
        const null_treshold = 5;
        let iLastMeasurement;
        moment.locale("nl");

        for (iLastMeasurement = raw_data.meting.values.length - 1; iLastMeasurement >= 0; iLastMeasurement--) {
          if (raw_data.meting.values[iLastMeasurement][0] !== null) {
            iLastMeasurement++;
            break
          }
        }

        //Loop again but this time only through the values that are defined
        for (let i = 0; i < iLastMeasurement; i++) {

          //Set the date and time arrays
          time[i] = moment.unix(raw_data.meting.times[i]).tz("Europe/Amsterdam").format("HH:mm");

          //Check for wind, wind gusts and direction if the value is null, if so, add to the array which counts the null values
          if (raw_data.meting.values[i][2] == null) {
            null_counter[0]++;
          }
          if (raw_data.meting.values[i][3] == null) {
            null_counter[1]++;
          }
          if (raw_data.meting.values[i][0] == null) {
            null_counter[2]++;
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
                    wind_speed[i] = wind_speed[i - 1];
                  } else {
                    wind_speed[i] = "";
                  }
                } else {
                  wind_speed[i] = (raw_data.meting.values[i][2] / 10 * 1.94384449);
                }
              }
              if (k == 1) {

                //If value is null, set it in the array as the previous value
                if (raw_data.meting.values[i][3] == null) {
                  if (wind_gusts[i - 1]) {
                    wind_gusts[i] = wind_speed[i - 1];
                  } else {
                    wind_gusts[i] = "";
                  }
                } else {
                  wind_gusts[i] = (raw_data.meting.values[i][3] / 10 * 1.94384449);
                }
              }
              if (k == 2) {

                //If value is null, set it in the array as the previous value
                if (raw_data.meting.values[i][0] == null) {
                  if (wind_direction[i - 1]) {
                    wind_direction[i] = wind_speed[i - 1];
                  } else {
                    wind_direction[i] = "";
                  }
                } else {
                  wind_direction[i] = raw_data.meting.values[i][0];
                }
              }
            }
          }
        }

        //Loop through all the values in the verwachtingen key, these will most likely be not equal to null
        for (let l = 0; l < raw_data.verwachting.values.length; l++) {

          //Add date for every timestamp of the day to the date array
          date[l] = moment.unix(raw_data.meting.times[l]).tz("Europe/Amsterdam").format("L");

          //Wind Speed
          if (raw_data.verwachting.values[l][0] !== null) {
            wind_speedFOR[l] = raw_data.verwachting.values[l][0] / 10 * 1.94384449;
          } else if (wind_speedFOR[l - 1]) {
            wind_speedFOR[l] = wind_speedFOR[l - 1]
          } else {
            wind_speedFOR[l] = "";
          }

          //Wind Direction
          if (raw_data.verwachting.values[l][1] !== null) {
            wind_directionFOR[l] = raw_data.verwachting.values[l][1];
          } else if (wind_directionFOR[l - 1]) {
            wind_directionFOR[l] = wind_directionFOR[l - 1]
          } else {
            wind_directionFOR[l] = "";
          }
        }

        //Add all the data to the main array which will be returned
        data["Rijkswaterstaat"] = [date, time, wind_speed, wind_gusts, wind_direction, wind_speedFOR, wind_directionFOR];
        resolve({
          data
        });

        //Errors: will be sent back and handled in other function (handleFetchErrors)
      }).catch(function (error) {
        data = {
          error: error,
          dataset: "Rijkswaterstaat"
        };
        resolve({
          data
        });
      });
  }

  //KNMI
  if (database_data.datasets.KNMI) {
    //Declare variables for fetching
    const dateKNMI = moment().tz("Europe/Amsterdam").format("YYYY-M-D");

    let loc_id_KNMI = database_data.datasets.KNMI.location_id;

    await fetch(`https://graphdata.buienradar.nl/1.0/actualarchive/weatherstation/${loc_id_KNMI}/?startDate=${dateKNMI}`, {})
      .then(response => response.text())
      .then(function (raw_data_text) {

        const raw_data = JSON.parse(raw_data_text);

        //Declare variables
        let date = [],
          time = [],
          wind_speed = [],
          wind_gusts = [],
          wind_direction = [];
        let null_counter = [0, 0, 0];
        const null_treshold = 5;

        //Loop through the data
        for (var i = 0; i < raw_data.observations.length; i++) {

          //Set the date and time arrays (data needs to be reformatted to Dutch)
          date[i] = raw_data.observations[i].datetime.split("T")[0].substring(8, 10) + "-" + raw_data.observations[i].datetime.split("T")[0].substring(5, 7) + "-" + raw_data.observations[i].datetime.split("T")[0].substring(0, 4);
          time[i] = raw_data.observations[i].datetime.split("T")[1].substring(0, 5);

          //Check for wind, wind gusts and direction if the value is null, if so, add to the array which counts the null values
          if (raw_data.observations[i].values.ff == null) {
            null_counter[0]++;
          }
          if (raw_data.observations[i].values.fx == null) {
            null_counter[1]++;
          }
          if (raw_data.observations[i].values.dd == null) {
            null_counter[2]++;
          }
        }

        //Loop for wind, wind gusts and direction (3 times, length of array null_counter)
        for (let k = 0; k < null_counter.length; k++) {

          //If the there are less null values in each array, good. Else the data is not considered good enough and the array remains empty
          if (null_counter[k] < null_treshold) {

            //Loop through all the data and add to the arrays (*0.53 for the factor to knots)
            for (let i = 0; i < raw_data.observations.length; i++) {
              if (k == 0) {
                wind_speed[i] = raw_data.observations[i].values.ff * 0.53995726994149;
              }
              if (k == 1) {
                wind_gusts[i] = raw_data.observations[i].values.fx * 0.53995726994149;
              }
              if (k == 2) {
                wind_direction[i] = raw_data.observations[i].values.dd;
              }
            }
          }
        }

        //Add all the data to the main array which will be returned
        data["KNMI"] = [date, time, wind_speed, wind_gusts, wind_direction];
        resolve({
          data
        });
        //Errors: will be sent back and handled in other function (handleFetchErrors)
      }).catch(function (error) {
        data = {
          error: error,
          dataset: "KNMI"
        };
        resolve({
          data
        });
      });
  }

  //Meetnet Vlaamse Banken
  if (database_data.datasets.MVB) {

    //MVB uses different timezone
    const dateMVB_b = moment().tz("Europe/Amsterdam").subtract(1, 'days').startOf('day').format("YYYY-MM-DD");
    const dateMVB_e = moment().tz("Europe/Amsterdam").format("YYYY-MM-DD");
    const DST = moment().tz("Europe/Amsterdam").subtract(1, 'days').startOf('day').isDST();
    let time_be;

    if (DST == false) {
      //Het is wintertijd
      time_be = "23:00:00";
    } else {
      //Het is zomertijd
      time_be = "22:00:00";
    }

    //Getting API key, if gotten, make request for data
    if (Object.keys(MVBAPIKey).length == 0 || (moment().unix() + 5) > MVBAPIKey.expirationDate) {
      await fetch("https://api.meetnetvlaamsebanken.be/Token", {
          "headers": {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
          },
          "body": `grant_type=password&username=${process.env.APP_EMAIL}&password=${process.env.MVB_PWD_ENCODED}`,
          "method": "POST"
        })
        .then(response => response.text())
        .then(async function (raw_data_text) {
          const raw_data = JSON.parse(raw_data_text);

          if (raw_data.Message) {
            if (raw_data.Message == "Login failed") {
              data = {
                error: {
                  code: "LOGINFAILED"
                },
                dataset: "MVB"
              };
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

            fetchDataMVB(raw_data["access_token"]);
          })

        })
        .catch(function (error) {
          data = {
            error: error,
            dataset: "MVB"
          };
        });

    } else {
      fetchDataMVB();
    }


    async function fetchDataMVB(newToken) {
      let keyFetch;

      if (newToken) {
        keyFetch = newToken
      } else {
        keyFetch = JSON.parse(fs.readFileSync("Meetnet Vlaamse Banken API key.json")).APIKey;
      }

      //Declare variables for fetching
      const loc_id_MVB = JSON.stringify(database_data.datasets.MVB.location_id);

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

          const raw_data = JSON.parse(raw_data_text);

          if (raw_data.Message) {
            if (raw_data.Message == "Authorization has been denied for this request.") {
              data = {
                error: "Error: Authorization has been denied for this request.",
                dataset: "MVB"
              };
            }
          } else {
            const times = [
              "00:00",
              "00:10",
              "00:20",
              "00:30",
              "00:40",
              "00:50",
              "01:00",
              "01:10",
              "01:20",
              "01:30",
              "01:40",
              "01:50",
              "02:00",
              "02:10",
              "02:20",
              "02:30",
              "02:40",
              "02:50",
              "03:00",
              "03:10",
              "03:20",
              "03:30",
              "03:40",
              "03:50",
              "04:00",
              "04:10",
              "04:20",
              "04:30",
              "04:40",
              "04:50",
              "05:00",
              "05:10",
              "05:20",
              "05:30",
              "05:40",
              "05:50",
              "06:00",
              "06:10",
              "06:20",
              "06:30",
              "06:40",
              "06:50",
              "07:00",
              "07:10",
              "07:20",
              "07:30",
              "07:40",
              "07:50",
              "08:00",
              "08:10",
              "08:20",
              "08:30",
              "08:40",
              "08:50",
              "09:00",
              "09:10",
              "09:20",
              "09:30",
              "09:40",
              "09:50",
              "10:00",
              "10:10",
              "10:20",
              "10:30",
              "10:40",
              "10:50",
              "11:00",
              "11:10",
              "11:20",
              "11:30",
              "11:40",
              "11:50",
              "12:00",
              "12:10",
              "12:20",
              "12:30",
              "12:40",
              "12:50",
              "13:00",
              "13:10",
              "13:20",
              "13:30",
              "13:40",
              "13:50",
              "14:00",
              "14:10",
              "14:20",
              "14:30",
              "14:40",
              "14:50",
              "15:00",
              "15:10",
              "15:20",
              "15:30",
              "15:40",
              "15:50",
              "16:00",
              "16:10",
              "16:20",
              "16:30",
              "16:40",
              "16:50",
              "17:00",
              "17:10",
              "17:20",
              "17:30",
              "17:40",
              "17:50",
              "18:00",
              "18:10",
              "18:20",
              "18:30",
              "18:40",
              "18:50",
              "19:00",
              "19:10",
              "19:20",
              "19:30",
              "19:40",
              "19:50",
              "20:00",
              "20:10",
              "20:20",
              "20:30",
              "20:40",
              "20:50",
              "21:00",
              "21:10",
              "21:20",
              "21:30",
              "21:40",
              "21:50",
              "22:00",
              "22:10",
              "22:20",
              "22:30",
              "22:40",
              "22:50",
              "23:00",
              "23:10",
              "23:20",
              "23:30",
              "23:40",
              "23:50",
              "00:00"
            ];
            //Declare variables
            let date = [],
              time = [],
              wind_speed = [],
              wind_gusts = [],
              wind_direction = [];

            let maxLength = 0;
            let maxLengthindex;

            // let measurementTime = moment(raw_data.Values[i].Values[j].Timestamp).format("HH:mm");
            //       let lastMeasurementTime = moment(raw_data.Values[i].Values[j].Timestamp).add(10, 'minutes').format("HH:mm");
            //       if ()
            // console.log(raw_data)
            let lastMeasurementH = moment(raw_data.Values[0].Values[raw_data.Values[0].Values.length - 1].Timestamp).format("HH");
            let lastMeasurementm = moment(raw_data.Values[0].Values[raw_data.Values[0].Values.length - 1].Timestamp).format("mm");

            let theoreticalMeasurementCount = lastMeasurementH * 6 + lastMeasurementm / 10 + 1
            console.log(theoreticalMeasurementCount)

            // Loop through the longest data for the times
            let reducer = 0;
            for (let i = 0; i < theoreticalMeasurementCount; i++) {

              //Set the date and time arrays (data needs to be reformatted to Dutch)
              // date[i] = moment().tz("Europe/Amsterdam").format("DD-MM-YYYY");
              // time[i] = moment(raw_data.Values[maxLengthindex].Values[i].Timestamp).format("HH:mm");
              if (moment(raw_data.Values[0].Values[i].Timestamp).format("HH:mm") !== times[i + reducer]) {
                reducer++;
                console.log("foutive meeting")
              }

              console.log(moment(raw_data.Values[0].Values[i].Timestamp).format("HH:mm"))
              console.log("moet gelijk zijn aan: " + times[i + reducer])
              // if (moment(raw_data.Values[0].Values[i].Timestamp).format("HH:mm") !== times[i]) {
              //   console.log("FOUT")
              // }
            }
            resolve()
            // reject();

            // for (let i = 0; i < raw_data.Values.length; i++) {
            //   if (raw_data.Values[i].Values.length > maxLength) {
            //     maxLength = raw_data.Values[i].Values.length;
            //     maxLengthindex = i;
            //   }

            //   //Windvlagen
            //   if (raw_data.Values[i].ID.includes("WC3")) {
            //     for (let j = 0; j < raw_data.Values[i].Values.length; j++) {
            //       if (raw_data.Values[i].Values[j].Value) {
            //         wind_gusts[j] = raw_data.Values[i].Values[j].Value;
            //       }
            //     }
            //   }

            //   //Windrichting
            //   if (raw_data.Values[i].ID.includes("WRS")) {
            //     for (let j = 0; j < raw_data.Values[i].Values.length; j++) {
            //       if (raw_data.Values[i].Values[j].Value) {
            //         wind_direction[j] = raw_data.Values[i].Values[j].Value;
            //       }
            //     }
            //   }

            //   //Windsnelheid
            //   if (raw_data.Values[i].ID.includes("WVC")) {
            //     for (let j = 0; j < raw_data.Values[i].Values.length; j++) {
            //       if (raw_data.Values[i].Values[j].Value) {
            //         wind_speed[j] = raw_data.Values[i].Values[j].Value;
            //       }
            //     }
            //   }
            // }

            //Add all the data to the main array which will be returned
            // data["MVB"] = [date, time, wind_speed, wind_gusts, wind_direction];
            // resolve({
            //   data
            // });
          }

          //Errors: will be sent back and handled in other function (handleFetchErrors)
        }).catch(function (error) {
          data = {
            error: error,
            dataset: "MVB"
          };
          resolve({
            data
          });
        });

    }
  }
}

module.exports = {
  fetchData
};