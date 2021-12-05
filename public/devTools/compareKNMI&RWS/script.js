window.onload = function () {
  let ids = [];
  const params = new URLSearchParams(window.location.search)
  for (const param of params) {
    ids.push(param);
  }
  const loc_id_RWS = ids[0][1];
  const loc_id_KNMI = ids[1][1];

  doData(loc_id_RWS, loc_id_KNMI)
};

async function doData(loc_id_RWS, loc_id_KNMI) {
  const data = await fetchData(loc_id_RWS, loc_id_KNMI);

  const lengths = [data.data["Rijkswaterstaat"][0].length, data.data["KNMI"][0].length].sort();
  const numberTR = lengths[1];

  let table = document.createElement("table");
  table.setAttribute("border", "1px");
  table.setAttribute("id", "values");
  let trHeader = document.createElement("tr");
  let tdHeaderTijdRws = document.createElement("td");
  tdHeaderTijdRws.textContent = "Tijd RWS"
  let tdHeaderTijdKNMI = document.createElement("td");
  tdHeaderTijdKNMI.textContent = "Tijd KNMI"
  let tdHeaderWindRws = document.createElement("td");
  tdHeaderWindRws.textContent = "Wind RWS"
  let tdHeaderWindKNMI = document.createElement("td");
  tdHeaderWindKNMI.textContent = "Wind KNMI"
  let tdHeaderWindgustsRWS = document.createElement("td");
  tdHeaderWindgustsRWS.textContent = "Windvlagen RWS"
  let tdHeaderWindgustsKNMI = document.createElement("td");
  tdHeaderWindgustsKNMI.textContent = "Windvlagen KNMI"
  let tdHeaderDeltaWind = document.createElement("td");
  tdHeaderDeltaWind.textContent = "Verschil"
  let tdHeaderDeltaWindgusts = document.createElement("td");
  tdHeaderDeltaWindgusts.textContent = "Verschil vlagen"

  trHeader.appendChild(tdHeaderTijdRws);
  trHeader.appendChild(tdHeaderTijdKNMI);
  trHeader.appendChild(tdHeaderWindRws);
  trHeader.appendChild(tdHeaderWindKNMI);
  trHeader.appendChild(tdHeaderDeltaWind);
  trHeader.appendChild(tdHeaderWindgustsRWS);
  trHeader.appendChild(tdHeaderWindgustsKNMI);
  trHeader.appendChild(tdHeaderDeltaWindgusts);

  table.appendChild(trHeader);
  let SUMDelta = 0;
  let SUMDeltaGusts = 0;
  const tolerance = 0.1;
  let counter = countergusts = 0;

  for (let i = 0; i < numberTR; i++) {
    let tr = document.createElement("tr");
    let tdRWStime = document.createElement("td");
    tdRWStime.setAttribute("class", "tdRWStime");
    let tdRWSwind = document.createElement("td");
    tdRWSwind.setAttribute("class", "tdRWSwind");
    let tdKNMItime = document.createElement("td");
    tdKNMItime.setAttribute("class", "tdKNMItime");
    let tdKNMIwind = document.createElement("td");
    tdKNMIwind.setAttribute("class", "tdKNMIwind");
    let tdRWSwindgusts = document.createElement("td");
    tdRWSwindgusts.setAttribute("class", "tdRWSwindgusts");
    let tdKNMIwindgusts = document.createElement("td");
    tdKNMIwindgusts.setAttribute("class", "tdKNMIwindgusts");
    let tdDeltawind = document.createElement("td");
    tdDeltawind.setAttribute("class", "tdDeltawind");
    let tdDeltawindgusts = document.createElement("td");
    tdDeltawindgusts.setAttribute("class", "tdDeltawindgusts");

    tr.appendChild(tdRWStime);
    tr.appendChild(tdRWSwind);
    tr.appendChild(tdKNMItime);
    tr.appendChild(tdKNMIwind);
    tr.appendChild(tdDeltawind);
    tr.appendChild(tdRWSwindgusts);
    tr.appendChild(tdKNMIwindgusts);
    tr.appendChild(tdDeltawindgusts);

    table.appendChild(tr);
  }
  document.body.appendChild(table);


  for (let j = 0; j < lengths[0]; j++) {
    document.getElementsByClassName("tdRWStime")[j].textContent = data.data["Rijkswaterstaat"][1][j];
    document.getElementsByClassName("tdRWSwind")[j].textContent = parseFloat(data.data["Rijkswaterstaat"][2][j]).toFixed(3);
    document.getElementsByClassName("tdRWSwindgusts")[j].textContent = parseFloat(data.data["Rijkswaterstaat"][3][j]).toFixed(3);
  }
  for (let k = 0; k < lengths[1]; k++) {
    document.getElementsByClassName("tdKNMItime")[k].textContent = data.data["KNMI"][1][k];
    document.getElementsByClassName("tdKNMIwind")[k].textContent = parseFloat(data.data["KNMI"][2][k]).toFixed(3);
    document.getElementsByClassName("tdKNMIwindgusts")[k].textContent = parseFloat(data.data["KNMI"][3][k]).toFixed(3);
    document.getElementsByClassName("tdDeltawind")[k].textContent = Math.abs(parseFloat(data.data["KNMI"][2][k]) - parseFloat(data.data["Rijkswaterstaat"][2][k])).toFixed(3);
    document.getElementsByClassName("tdDeltawindgusts")[k].textContent = Math.abs(parseFloat(data.data["KNMI"][3][k]) - parseFloat(data.data["Rijkswaterstaat"][3][k])).toFixed(3);

    if (data.data["KNMI"][2][k] && data.data["Rijkswaterstaat"][2][k]) {
      SUMDelta += Math.abs(parseFloat(data.data["KNMI"][2][k]) - parseFloat(data.data["Rijkswaterstaat"][2][k]));
      counter++;
    }
    if (data.data["KNMI"][2][k] && data.data["Rijkswaterstaat"][2][k]) {
      SUMDeltaGusts += Math.abs(parseFloat(data.data["KNMI"][3][k]) - parseFloat(data.data["Rijkswaterstaat"][3][k]));
      countergusts++;
    }
  }

  const avgDelta = SUMDelta / counter;
  const avgDeltagusts = SUMDeltaGusts / countergusts;

  document.getElementsByTagName("h2")[0].textContent += " D_wind = " + avgDelta.toFixed(5);
  if (avgDelta < tolerance) {
    document.getElementsByTagName("h2")[0].textContent += " so data can be considered the same, D_gusts = " + avgDeltagusts.toFixed(5) + ")";
  } else if (avgDelta > tolerance) {
    document.getElementsByTagName("h2")[0].textContent += " so data cannot be considered the same, D_gusts = " + avgDeltagusts.toFixed(5);
  }

}

async function fetchData(loc_id_RWS, loc_id_KNMI) {

  let data = [];

  // Rijkswaterstaat
  //Rijkswaterstaat uses different timezone, so for midnight we need 22.00 from the previous day
  const dateRWS_b = moment().subtract(1, 'days').startOf('day').format("YYYY-MM-DD");
  const dateKNMI_e = moment().format("YYYY-MM-DD");

  await fetch(`https://waterberichtgeving.rws.nl/wbviewer/wb_api.php?request=windrose&meting=WN_S_1.2-5&loc=${loc_id_RWS}&start=${dateRWS_b}T22:00:00Z&end=${dateKNMI_e}T22:00:00Z`)
    .then(response => response.json())
    .then(function (raw_data) {

      //Declare variables and set option for moment
      let date = [],
        time = [],
        wind_speed = [],
        wind_gusts = [],
        wind_direction = [];
      let iLastMeasurement;
      moment.locale("nl");

      //Loop through the data till one time is empty (RWS puts arrays for the whole day, so a lot will be empty)
      for (iLastMeasurement = 0; iLastMeasurement < raw_data.meting.values.length; iLastMeasurement++) {
        if (raw_data.meting.values[iLastMeasurement][0] == undefined || raw_data.meting.values[iLastMeasurement][0] == "" || raw_data.meting.values[iLastMeasurement][0] == null) {
          break
        }
      }

      //Loop again but this time only through the values that are defined
      for (let i = 0; i < iLastMeasurement; i++) {

        //Set the date and time arrays
        date[i] = moment.unix(raw_data.meting.times[i]).format("L");
        time[i] = moment.unix(raw_data.meting.times[i]).format("HH:mm");
        wind_speed[i] = (raw_data.meting.values[i][2] / 10 * 1.94384449);
        wind_gusts[i] = (raw_data.meting.values[i][3] / 10 * 1.94384449);
        wind_direction[i] = raw_data.meting.values[i][0];
      }

      //Add all the data to the main array which will be returned
      data["Rijkswaterstaat"] = [date, time, wind_speed, wind_gusts, wind_direction];

      //Errors: will be sent back and handled in other function (handleFetchErrors)
    }).catch(function (error) {
      data = {
        error: error,
        dataset: "Rijkswaterstaat"
      };
    });


  //KNMI
  //Declare variables for fetching
  const dateKNMI = moment().format("YYYY-M-D");

  await fetch(`https://graphdata.buienradar.nl/1.0/actualarchive/weatherstation/${loc_id_KNMI}/?startDate=${dateKNMI}`, {})
    .then(response => response.text())
    // .then(response => response.json())
    .then(function (raw_data_text) {

      const raw_data = JSON.parse(raw_data_text);

      //Declare variables
      let date = [],
        time = [],
        wind_speed = [],
        wind_gusts = [],
        wind_direction = [];

      //Loop through the data
      for (var i = 0; i < raw_data.observations.length; i++) {

        //Set the date and time arrays (data needs to be reformatted to Dutch)
        date[i] = raw_data.observations[i].datetime.split("T")[0].substring(8, 10) + "-" + raw_data.observations[i].datetime.split("T")[0].substring(5, 7) + "-" + raw_data.observations[i].datetime.split("T")[0].substring(0, 4);
        time[i] = raw_data.observations[i].datetime.split("T")[1].substring(0, 5);
        wind_speed[i] = raw_data.observations[i].values.ff * 0.53995726994149;
        wind_gusts[i] = raw_data.observations[i].values.fx * 0.53995726994149;
        wind_direction[i] = raw_data.observations[i].values.dd;
      }

      //Add all the data to the main array which will be returned
      data["KNMI"] = [date, time, wind_speed, wind_gusts, wind_direction];

      //Errors: will be sent back and handled in other function (handleFetchErrors)
    }).catch(function (error) {
      data = {
        error: error,
        dataset: "KNMI"
      };
    });

  //Send data back to the upperlying function
  return {
    data
  };
}