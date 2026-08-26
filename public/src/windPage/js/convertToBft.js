export function convertToBft(rawValues, displayValues) {
	const arraysToConvert = ["windSpeed", "windGusts", "windSpeedForecast", "windGustsForecast"];
	arraysToConvert.forEach((dataType) => {
		if (!rawValues[dataType]) return;

		for (let i = 0; i < rawValues[dataType].length; i++) {
			// Check first extreme: windforce 0
			if (parseFloat(rawValues[dataType][i]) < units.Bft.ranges[0]) {
				if (displayValues[dataType][i]) displayValues[dataType][i] = "0";
			}

			//Loop through every windforce and check if the value falls into that category
			for (let j = 0; j < units.Bft.ranges.length - 1; j++) {
				if (
					parseFloat(rawValues[dataType][i]) >= units.Bft.ranges[j] &&
					parseFloat(rawValues[dataType][i]) < units.Bft.ranges[j + 1]
				) {
					if (displayValues[dataType][i]) displayValues[dataType][i] = (j + 1).toString();
				}
			}

			//Check second extreme: windforce 12
			if (parseFloat(rawValues[dataType][i]) >= units.Bft.ranges[11]) {
				if (displayValues[dataType][i]) displayValues[dataType][i] = "12";
			}
		}
	});
}
