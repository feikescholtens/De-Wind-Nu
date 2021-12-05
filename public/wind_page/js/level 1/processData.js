//Proces the data
async function processData(data_fetched) {
  //Declare variables
  const spotName = data_fetched.name;
  const DOM_eenheid = document.getElementById("eenheid");
  const DOM_decimalen = document.getElementById("decimals");
  const DOM_subtitle = document.getElementById("subtitle");
  const DOM_compass = document.getElementById("wind_compass");
  const DOM_actuele_gegevens_box = document.getElementById("actuele_gegevens");
  const ctx = DOM_compass.getContext("2d");
  const size = 350;
  let chart_windspeed, chart_winddirection;
  const DOM_chart_windspeed = document.getElementById('chart_windspeed').getContext('2d');
  const DOM_chart_winddirection = document.getElementById('chart_winddirection').getContext('2d');
  times = await fetch("json/chartTimes.json").then(response => response.json()).then(data => {
    return data.chartTimes;
  });
  units = await fetch("json/units.json").then(response => response.json()).then(data => {
    return data.units;
  });

  // document.getElementById("chart_windspeed").addEventListener("click", function () {
  //   drawUpdateChart(chart_windspeed, chart_winddirection, DOM_chart_windspeed, DOM_chart_winddirection, times, units, ctx, size);
  //   console.log("dermate")
  // });
  // document.getElementById("chart_winddirection").addEventListener("click", function () {
  //   drawUpdateChart(chart_windspeed, chart_winddirection, DOM_chart_windspeed, DOM_chart_winddirection, times, units, ctx, size);
  //   console.log("dermate")
  // });

  const data_fetchedNoName = JSON.parse(JSON.stringify(data_fetched));
  delete data_fetchedNoName.name;
  dataset = Object.keys(data_fetched)[0];

  //Setting local storage variables if never set before
  if (localStorage.getItem("unit") == undefined) {
    localStorage.setItem("unit", 0);
  }
  if (localStorage.getItem("decimals") == undefined) {
    localStorage.setItem("decimals", 1);
  }

  //Sets the options in the settingstable for the ones in local storage
  DOM_eenheid.value = localStorage.getItem("unit");
  DOM_decimalen.value = localStorage.getItem("decimals");
  if (DOM_eenheid.value == 4) {
    DOM_decimalen.setAttribute("disabled", "disabled");
  }

  //(1)Change the data in local storage when other options are selected and (2) refresh the graphs
  DOM_eenheid.onchange = function () {
    //Set the new value in storage
    localStorage.setItem("unit", DOM_eenheid.value);

    //If unit is set to Bft, lock the selection of the amout of decimals
    if (DOM_eenheid.value == 4) {
      DOM_decimalen.setAttribute("disabled", "disabled");
      decimals = 0;
    } else {
      DOM_decimalen.removeAttribute("disabled");
    }

    //Refresh data
    drawUpdateChart(chart_windspeed, chart_winddirection, DOM_chart_windspeed, DOM_chart_winddirection, times, units, ctx, size);
  }
  DOM_decimalen.onchange = function () {
    //Set the new value in storage
    localStorage.setItem("decimals", DOM_decimalen.value);

    //Refresh data
    drawUpdateChart(chart_windspeed, chart_winddirection, DOM_chart_windspeed, DOM_chart_winddirection, times, units, ctx, size);
  }

  data[dataset] = data_fetched[dataset];
  data_unit[dataset] = JSON.parse(JSON.stringify(data_fetched[dataset]));

  //Data is now loaded, so the content get can displayed and the loading symbol removed
  document.title = "De Wind Nu: " + spotName;
  if (dataset == "Rijkswaterstaat") {
    DOM_subtitle.innerHTML = spotName + "<br><span class='small'>" + dataset + " & ECMWF</span";
  } else if (dataset == "KNMI") {
    DOM_subtitle.innerHTML = spotName + "<br><span class='small'>" + dataset + "</span>";
  } else if (dataset == "MVB") {
    DOM_subtitle.innerHTML = spotName + "<br><span class='small'>Meetnet Vlaamse Banken</span>";
    document.getElementById("decimals").getElementsByTagName("option")[2].innerHTML = 2;
  }
  document.getElementsByTagName("header")[0].style.visibility = document.getElementsByTagName("main")[0].style.visibility = document.getElementsByTagName("footer")[0].style.visibility = "visible";
  document.getElementById("loader").style.display = "none";

  //Make the canvas of the current wind section dynamic (1: initially, 2: onwindowchange)
  //(1)
  DOM_compass.style.width = "100%";
  DOM_compass.style.height = DOM_compass.clientWidth;
  //(2)
  window.onresize = function () {
    DOM_compass.style.height = DOM_compass.clientWidth;
    DOM_actuele_gegevens_box.style.width = DOM_actuele_gegevens_box.style.height = (DOM_compass.clientWidth * (200 / size)) / Math.sqrt(2) + "px";
    DOM_actuele_gegevens_box.style.marginTop = -(175 / size) * DOM_compass.clientWidth + "px";
  };
  DOM_compass.style.height = DOM_compass.clientWidth;
  DOM_actuele_gegevens_box.style.width = DOM_actuele_gegevens_box.style.height = (DOM_compass.clientWidth * (200 / size)) / Math.sqrt(2) + "px";
  DOM_actuele_gegevens_box.style.marginTop = -(175 / size) * DOM_compass.clientWidth + "px";

  //Process the data
  drawUpdateChart(chart_windspeed, chart_winddirection, DOM_chart_windspeed, DOM_chart_winddirection, times, units, ctx, size);
}