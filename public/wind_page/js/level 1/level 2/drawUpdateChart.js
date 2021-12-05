function drawUpdateChart(chart_windspeed, chart_winddirection, DOM_chart_windspeed, DOM_chart_winddirection, times, units, ctx, size) {

  //Declare variables
  unit = localStorage.getItem("unit");
  decimals = localStorage.getItem("decimals");

  //Reset/define the datasets arrays
  let datasetsChart1 = [];
  let datasetsChart2 = [];

  //If the set unit it not equal to Bft
  if (parseInt(unit) !== 4) {

    //Loop through the data by windspeed indici
    for (let i = 0; i < data_unit[dataset][2].length; i++) {

      //Set the data to the windspeed array
      data_unit[dataset][2][i] = (units[unit].factor * data[dataset][2][i]).toFixed(decimals);

      //There is not always gusts data, therefore we check first and then do the same
      if (data_unit[dataset][3].length !== 0) {
        data_unit[dataset][3][i] = (units[unit].factor * data[dataset][3][i]).toFixed(decimals);
      }
    }

    //Loop through the data by forecast indici
    if (data_unit[dataset][5]) {
      for (let i = 0; i < data_unit[dataset][5].length; i++) {

        //Set the data to the windspeedFOR array
        data_unit[dataset][5][i] = (units[unit].factor * data[dataset][5][i]).toFixed(decimals);
      }
    }

    //Else convert the data to Bft in seperate function
  } else if (parseInt(unit) == 4) {
    convertToBft(data, data_unit, dataset);
  }

  //Update the current wind section on top of the page in separte function
  updateCurrentWind(units, ctx, size);

  const maxWind = Math.max(...data_unit[dataset][2].filter(function (value, index, arr) {
    return value !== "NaN";
  }));
  const maxGusts = Math.max(...data_unit[dataset][3].filter(function (value, index, arr) {
    return value !== "NaN";
  }));

  wind_obj.label = `Windsterkte | max: ${maxWind.toFixed(decimals).replace(".", ",")} ${units[unit].afkorting}`
  wind_gusts_obj.label = `Windvlagen | max: ${maxGusts.toFixed(decimals).replace(".", ",")} ${units[unit].afkorting}`
  //Set unit on the chart's y-axis and set y-axis scale
  options_chart.scales.y.title.text = "Windsnelheid [" + units[unit].afkorting + "]";
  delete options_chart.scales.y.ticks;
  delete options_chart.scales.y.min;
  delete options_chart.scales.y.max;

  //In any case add the wind_speed data to the dataset for the chart
  datasetsChart1.push(wind_obj);
  datasetsChart1[0].data = data_unit[dataset][2];

  //If there is data for the windgusts, add it too
  if (data_unit[dataset][3].length !== 0) {
    datasetsChart1.push(wind_gusts_obj);
    datasetsChart1[1].data = data_unit[dataset][3];

    //If not, remove the windgusts from the dataset, this needs to be checked when the dataset is changed
  } else if (data_unit[dataset][3].length == 0 && datasetsChart1.length == 2) {
    datasetsChart1 = datasetsChart1.slice(0, 1);
  }

  //If there is forecast data for the wind, add it too
  if (data_unit[dataset][5]) {
    if (data_unit[dataset][5].length !== 0) {
      datasetsChart1.push(wind_forecast_obj);
      datasetsChart1[datasetsChart1.length - 1].data = data_unit[dataset][5];

      //If not, remove from the forecast data from the dataset, this needs to be checked when the dataset is changed
    } else if (data_unit[dataset][5].length == 0 && datasetsChart1.length == 3) {
      datasetsChart1 = datasetsChart1.slice(0, 2);
    }
  }

  //If chart is not created, create
  if (Chart.instances[0] == undefined) {

    chart_windspeed = new Chart(DOM_chart_windspeed, {
      type: 'line',
      data: {
        labels: times,
        datasets: datasetsChart1
      },
      options: options_chart,
      plugins: [tooltipLine],
    });

    //Else, create chart
  } else {
    chart_windspeed = Chart.instances[0];

    //Set the data and options for the (already existing) chart and update
    chart_windspeed.data.datasets = datasetsChart1;
    chart_windspeed.options = options_chart;
    chart_windspeed.update();
  }

  //Set unit on the chart's y-axis and set y-axis scale
  options_chart.scales.y.title.text = "Windrichting [°]";
  options_chart.scales.y = {
    ...options_chart.scales.y,
    ...directionChartTicks.ticks
  }

  //In any case add the wind_speed data to the dataset for the chart
  datasetsChart2.push(winddirection_obj);
  datasetsChart2[0].data = data_unit[dataset][4];

  //If there is data for the windgusts, add it too
  if (data_unit[dataset][6]) {
    if (data_unit[dataset][6].length !== 0) {
      datasetsChart2.push(winddirectionForecast_obj);
      datasetsChart2[1].data = data_unit[dataset][6];

      //If not, remove from the windgusts from the dataset, this needs to be checked when the dataset is changed
    } else if (data_unit[dataset][6].length == 0 && datasetsChart2.length == 2) {
      datasetsChart2 = datasetsChart2.slice(0, 1);
    }
  } else if (datasetsChart2.length == 2) {
    datasetsChart2 = datasetsChart2.slice(0, 1);
  }

  //If chart is not created, create
  if (Chart.instances[1] == undefined) {

    chart_winddirection = new Chart(DOM_chart_winddirection, {
      type: 'line',
      data: {
        labels: times,
        datasets: datasetsChart2
      },
      options: options_chart,
      plugins: [tooltipLine],
    });

    //Else, create chart
  } else {
    chart_winddirection = Chart.instances[1];

    //Set the data and options for the (already existing) chart and update
    chart_winddirection.data.datasets = datasetsChart2;
    chart_winddirection.options = options_chart;
    chart_winddirection.update();
  }
}