/** biome-ignore-all lint/suspicious/noGlobalIsNan: Global isNaN use is intended **/
import { convertToBft } from "./convertToBft.js";
import { updateGraphs, updateTable } from "./graphOrTableUpdate.js";
import { updateCurrentWind } from "./updateDisplayCurrentWind.js";

export async function contentUpdate() {
	//(This 'backup' is restored to the original 'rawValues' variable so interpolation setting can change on the fly)
	const rawValuesBeforeInterpolation = rawValues.copy();

	//Put interolated data into the arrays if requested
	const dataTypeArray = ["windSpeed", "windGusts", "windDirection"];
	dataTypeArray.forEach((dataType) => {
		// biome-ignore lint/suspicious/noDoubleEquals: Needs to check for both undefined and null
		if (rawValues[dataType] != undefined) {
			for (let k = 0; k < rawValues[dataType].length; k++) {
				if (rawValues[dataType][k] < 0 || isNaN(rawValues[dataType][k])) {
					//Also checking for NaN's because of data is already loaded, negative values are replaced with NaN
					if (interpolation === "1") {
						rawValues[dataType][k] = interpolatedData[dataType].filter(
							(element) => element.index === k,
						)[0].value;
					} else rawValues[dataType][k] = undefined;
				}
			}
		}
	});

	//Converting arrays to have correct units
	const arrays = [
		"windSpeed",
		"windGusts",
		"windDirection",
		"windSpeedForecast",
		"windGustsForecast",
		"windDirectionForecast",
	];
	const arraysUnitChange = ["windSpeed", "windGusts", "windSpeedForecast", "windGustsForecast"];
	const arraysNoUnitChange = ["windDirection", "windDirectionForecast"];
	const arraysAlways0Decimal = ["windDirection", "windDirectionForecast"];
	//Upper arrays and approach below is more general and allows for easily adding more dataTypes in the future :-)

	arrays.forEach((dataType) => {
		if (displayValues[dataType] && displayValues[dataType].length !== 0) {
			for (let i = 0; i < displayValues[dataType].length; i++) {
				// biome-ignore lint/suspicious/noDoubleEquals: Needs to check for both undefined and null
				if (displayValues[dataType][i] != undefined) {
					//Unit needs to be changed
					if (arraysUnitChange.includes(dataType)) {
						if (arraysAlways0Decimal.includes(dataType))
							displayValues[dataType][i] = (units[unit].factor * rawValues[dataType][i]).toFixed(0);
						else
							displayValues[dataType][i] = (units[unit].factor * rawValues[dataType][i]).toFixed(
								decimals,
							);
					}

					//Unit does't need to be changed (the * 1 needs to happen to let undefined become NaN)
					if (arraysNoUnitChange.includes(dataType)) {
						if (arraysAlways0Decimal.includes(dataType))
							displayValues[dataType][i] = (1 * rawValues[dataType][i]).toFixed(0);
						else displayValues[dataType][i] = (1 * rawValues[dataType][i]).toFixed(decimals);
					}
				}
			}
		}
	});

	if (unit === "Bft") convertToBft(rawValues, displayValues);

	//
	if (
		displayValues.windSpeed.length !== 0 ||
		displayValues.windGusts.length !== 0 ||
		displayValues.windDirection.length !== 0
	)
		updateCurrentWind();

	if (localStorage.getItem("dataForm") === "graphs") updateGraphs();
	if (localStorage.getItem("dataForm") === "table") updateTable();

	rawValues = rawValuesBeforeInterpolation.copy();
}
