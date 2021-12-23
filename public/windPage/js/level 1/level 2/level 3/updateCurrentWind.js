Array.prototype.lastMeasurement = function() {
  return this[this.length - 1]
}

function updateCurrentWind(units, ctx, size) {

  //Define all the DOM elements
  const DOM_actuele_wind = document.getElementById("actuele_wind");
  const DOM_voorspelde_wind = document.getElementById("voorspelde_wind");
  const DOM_actuele_vlagen = document.getElementById("actuele_vlagen");
  const DOM_actuele_richting = document.getElementById("actuele_richting");
  const DOM_voorspelde_richting = document.getElementById("voorspelde_richting");
  const DOM_actueel_header = document.getElementById("heading_current_wind");
  const DOM_chart1_header = document.getElementById("heading_chart1");
  const DOM_chart2_header = document.getElementById("heading_chart2");
  const actuele_richting = data_unit[4].lastMeasurement();

  DOM_actuele_richting.innerHTML = "";
  DOM_actuele_wind.innerHTML = "";
  DOM_voorspelde_richting.innerHTML = "";
  DOM_voorspelde_wind.innerHTML = "";
  DOM_actuele_vlagen.innerHTML = "";

  //First, clear the canvas ortherwise two arrows will be shown when switching dataset
  ctx.clearRect(0, 0, size, size);

  //If there is a forecasted direction
  if (data_unit[6]) {
    if (data_unit[6].length !== 0) {

      const forecastedDirection = data_unit[6][data_unit[4].length - 1];

      //Call function to draw the right arrows in the canvas
      drawDirectionArrow(forecastedDirection, ctx, size, "#ff9f43");

      //Set new value in the box
      DOM_voorspelde_richting.innerHTML = forecastedDirection + "&#176;<label class='label2'> voorspeld</label>";
    }
  }

  //If the current direction is defined
  if (actuele_richting !== null && actuele_richting !== undefined) {

    //Call function to draw the right arrows in the canvas
    drawDirectionArrow(actuele_richting, ctx, size, "#5f27cd");

    //Get current direction in letters
    const actuele_richting_letters = directionToLetters(actuele_richting);

    //Set new value in the box
    DOM_actuele_richting.innerHTML = actuele_richting.toFixed(0) + "&#176; / " + actuele_richting_letters;
  }

  //If there are values set for the current wind
  if (data_unit[2].length !== 0) {

    //Set new value in the box, replace correct decimal point and add unit
    DOM_actuele_wind.innerHTML = data_unit[2].lastMeasurement().replace(".", ",") + " " + units[unit].afkorting;
  }

  //If there are values set for the forecasted wind
  if (data_unit[5]) {
    if (data_unit[5].length !== 0 && data_unit[5][data_unit[4].length - 1] !== "0.00") {

      //Set new value in the box, replace correct decimal point and add unit
      DOM_voorspelde_wind.innerHTML = data_unit[5][data_unit[4].length - 1].replace(".", ",") + " " + units[unit].afkorting + "<label class='label2'> voorspeld</label>";
    }
  }

  if (data_unit[3].length !== 0 && data_unit[3].length == data_unit[2].length && data_unit[3].lastMeasurement() !== "NaN") {

    DOM_actuele_vlagen.innerHTML = data_unit[3].lastMeasurement().replace(".", ",") + " " + units[unit].afkorting + "<label class='label'>&nbsp;vlagen</label>";
  }

  if (DOM_actuele_vlagen.innerHTML !== "" && DOM_voorspelde_richting.innerHTML !== "" && DOM_voorspelde_wind.innerHTML !== "") {
    DOM_chart1_header.innerHTML = "Windsterkte en -vlagen";
    DOM_actuele_richting.style.top = "79%";
    DOM_actuele_wind.style.top = "15%";
    DOM_voorspelde_richting.style.top = "95%";
    DOM_voorspelde_wind.style.top = "39%";
    DOM_actuele_vlagen.style.top = "55%";

  } else if (DOM_actuele_vlagen.innerHTML !== "" && DOM_voorspelde_richting.innerHTML == "" && DOM_voorspelde_wind.innerHTML == "") {

    DOM_chart1_header.innerHTML = "Windsterkte en -vlagen";
    DOM_actuele_richting.style.top = "75%";
    DOM_actuele_wind.style.top = "22%";
    DOM_actuele_vlagen.style.top = "50%";
  } else if (DOM_actuele_vlagen.innerHTML == "" && DOM_voorspelde_richting.innerHTML !== "" && DOM_voorspelde_wind.innerHTML !== "") {

    DOM_chart1_header.innerHTML = "Windsterkte";
    DOM_actuele_richting.style.top = "69%";
    DOM_actuele_wind.style.top = "20%";
    DOM_voorspelde_richting.style.top = "89%";
    DOM_voorspelde_wind.style.top = "47%";
  } else if (DOM_actuele_vlagen.innerHTML !== "" && DOM_voorspelde_richting.innerHTML == "" && DOM_voorspelde_wind.innerHTML !== "") {

    DOM_chart1_header.innerHTML = "Windsterkte en -vlagen";
    DOM_actuele_richting.style.top = "85%";
    DOM_actuele_wind.style.top = "17%";
    DOM_voorspelde_wind.style.top = "43%";
    DOM_actuele_vlagen.style.top = "63%";
  } else if (DOM_actuele_vlagen.innerHTML !== "" && DOM_voorspelde_richting.innerHTML !== "" && DOM_voorspelde_wind.innerHTML == "") {

    DOM_chart1_header.innerHTML = "Windsterkte en -vlagen";
    DOM_actuele_richting.style.top = "70%";
    DOM_actuele_wind.style.top = "17%";
    DOM_voorspelde_richting.style.top = "88%";
    DOM_actuele_vlagen.style.top = "45%";
  } else if (DOM_actuele_vlagen.innerHTML == "" && DOM_voorspelde_richting.innerHTML == "" && DOM_voorspelde_wind.innerHTML == "") {

    DOM_chart1_header.innerHTML = "Windsterkte";
    DOM_actuele_richting.style.top = "69%";
    DOM_actuele_wind.style.top = "38%";
  }

  DOM_chart2_header.innerHTML = "Windrichting";

  //Set the latest time in de "Actueel" header
  const lastMeasurementTime = data_unit[1][data_unit[2].length - 1]
  DOM_actueel_header.innerHTML = "Actueel (" + lastMeasurementTime + ")";
}