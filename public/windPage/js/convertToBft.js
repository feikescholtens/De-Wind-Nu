export function convertToBft(data, dataWUnits) {

  const arraysToConvert = ["windSpeed", "windGusts", "windSpeedForecast", "windGustsForecast"]
  arraysToConvert.forEach(dataType => {

    for (let i = 0; i < data[dataType].length; i++) {

      // Check first extreme: windforce 0
      if (parseFloat(data[dataType][i]) < units["Bft"].ranges[0]) {
        if (dataWUnits[dataType][i]) dataWUnits[dataType][i] = "0"
      }

      //Loop through every windforce and check if the value falls into that category
      for (let j = 0; j < (units["Bft"].ranges.length - 2); j++) {
        if ((parseFloat(data[dataType][i]) >= units["Bft"].ranges[j]) && (parseFloat(data[dataType][i]) < units["Bft"].ranges[j + 1])) {
          if (dataWUnits[dataType][i]) dataWUnits[dataType][i] = (j + 1).toString()
        }
      }

      //Check second extreme: windforce 12
      if (parseFloat(data[dataType][i]) >= units["Bft"].ranges[11]) {
        if (dataWUnits[dataType][i]) dataWUnits[dataType][i] = "12"
      }
    }

  })

}