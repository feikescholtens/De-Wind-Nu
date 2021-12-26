export function convertToBft(data, data_unit) {

  //Define variable
  let checkArray;
  let convertForecastWind;

  //Check if there is forecast data, if so loop through that array, else, through the normal windspeed array
  if (data_unit[5]) {
    if (data_unit[5].length > data_unit[2].length) {
      checkArray = data_unit[5];
      convertForecastWind = 6;
    } else {
      checkArray = data_unit[2];
      convertForecastWind = 5;
    }
  } else {
    checkArray = data_unit[2];
    convertForecastWind = 5;
  }

  //Loop through every value of the dataset
  for (let i = 0; i < checkArray.length; i++) {

    //Loop 3 times both the indices 2, 3, 5 for respectively normal wind and gusts
    for (let k = 2; k < convertForecastWind; k++) {
      if (k !== 4) {
        //Check first extreme: windforce 0
        if (parseFloat(data[k][i]) < units[4].ranges[0]) {
          data_unit[k][i] = "0";
        }

        //Loop through every windforce and check if the value falls into that category
        for (let j = 0; j < (units[4].ranges.length - 2); j++) {
          if ((parseFloat(data[k][i]) >= units[4].ranges[j]) && (parseFloat(data[k][i]) < units[4].ranges[j + 1])) {
            data_unit[k][i] = (j + 1).toString();
          }
        }

        //Check second extreme: windforce 12
        if (parseFloat(data[k][i]) >= units[4].ranges[11]) {
          data_unit[k][i] = "12";
        }
      }
    }
  }


}