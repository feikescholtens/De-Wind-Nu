/** biome-ignore-all lint/suspicious/noGlobalIsNan: Global isNaN() is needed here **/
import {
	CategoryScale,
	Chart,
	Legend,
	LinearScale,
	LineController,
	LineElement,
	PointElement,
	Tooltip,
} from "chart.js";
import {
	datasetObject,
	getDatasetInfo,
	optionsWindDirectionChart,
	optionsWindSpeedChart,
	tooltipRenderer,
} from "../js/objects/chartData.js";

Chart.register(
	LinearScale,
	CategoryScale,
	LineController,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
);

const graphNodeElements = [
	document.querySelector("[data-headingchartwindspeed]"),
	document.querySelector("[data-chartwindSpeed]"),
	document.querySelector("[data-headingchartwinddirection]"),
	document.querySelector("[data-chartwindDirection]"),
	...document.querySelectorAll(".tooltipWrapper"),
];
const tableNodeElements = [
	document.querySelector("[data-headingTabel]"),
	document.querySelector("[data-dataTable]"),
];

export function updateGraphs() {
	document.querySelector("main").style.overflow = "hidden"; //Only needed for Safari browser

	//Setting light/dark mode colours, see also below for colours of the grid (these need to be changed after the chart is initialized)
	optionsWindSpeedChart.plugins.legend.labels.color =
		optionsWindSpeedChart.scales.y.title.color =
		optionsWindSpeedChart.scales.x.ticks.color =
		optionsWindSpeedChart.scales.y.ticks.color =
		optionsWindDirectionChart.plugins.legend.labels.color =
		optionsWindDirectionChart.scales.y.title.color =
		optionsWindDirectionChart.scales.x.ticks.color =
		optionsWindDirectionChart.scales.y.ticks.color =
			getComputedStyle(document.body).getPropertyValue("--textColour2");

	graphNodeElements.forEach((element) => {
		element.classList.remove("noDisplay");
	});
	tableNodeElements.forEach((element) => {
		element.classList.add("noDisplay");
	});

	//Initialize datasets
	const datasetInfo = getDatasetInfo();
	const datasets = datasetInfo.copy();

	const dataTypeArray = [
		"windSpeed",
		"windGusts",
		"windDirection",
		"windSpeedForecast",
		"windGustsForecast",
		"windDirectionForecast",
	];
	dataTypeArray.forEach((dataType) => {
		datasets[dataType] = { ...datasets[dataType], ...datasetObject };
		if (displayValues[dataType]) datasets[dataType].data = displayValues[dataType];

		if (JSON.parse(localStorage.getItem("hiddenDatasets"))[datasets[dataType].label])
			datasets[dataType].hidden = true;
	});

	if (interpolation === 1) {
		datasets.windSpeed.segment = {
			borderColor: (ctx) =>
				checkInterpolated(ctx, "windSpeed", datasetInfo.windSpeed.backgroundColor),
		};
		datasets.windGusts.segment = {
			borderColor: (ctx) =>
				checkInterpolated(ctx, "windGusts", datasetInfo.windGusts.backgroundColor),
		};
		datasets.windDirection.segment = {
			borderColor: (ctx) =>
				checkInterpolated(ctx, "windDirection", datasetInfo.windDirection.backgroundColor),
		};
	}

	// Chart windspeed
	const canvasWindSpeed = document.querySelector("[data-chartWindSpeed]").getContext("2d");
	let chartWindSpeed,
		datasetsChartWindSpeed = [];

	const dataTypesChartWindSpeed = [
		"windSpeed",
		"windGusts",
		"windSpeedForecast",
		"windGustsForecast",
	];
	dataTypesChartWindSpeed.forEach((dataType) => {
		if (displayValues[dataType] && displayValues[dataType].length !== 0)
			datasetsChartWindSpeed.push(datasets[dataType]);
	});

	optionsWindSpeedChart.scales.y.title.text = `Windsnelheid [${unit}]`;

	if (!Chart.instances[0])
		chartWindSpeed = new Chart(
			canvasWindSpeed,
			newChartOptions(datasetsChartWindSpeed, optionsWindSpeedChart),
		);
	else {
		chartWindSpeed = Chart.instances[0];

		chartWindSpeed.data.labels = times;
		chartWindSpeed.data.datasets = datasetsChartWindSpeed;
		chartWindSpeed.options = optionsWindSpeedChart;
		chartWindSpeed.update();
	}

	//Chart winddirection
	if (displayValues.windDirection.length === 0 && !displayValues.windDirectionForecast) {
		document.querySelector("[data-headingchartwinddirection]").classList.add("noDisplay");
		document.querySelector("[data-chartwindDirection]").classList.add("noDisplay");
		return;
	}

	const canvasWindDirection = document.querySelector("[data-chartWindDirection]").getContext("2d");
	let chartWindDirection,
		datasetsChartWindDirection = [];

	if (displayValues.windDirection.length !== 0)
		datasetsChartWindDirection.push(datasets.windDirection);
	if (displayValues.windDirectionForecast)
		if (displayValues.windDirectionForecast.length !== 0)
			datasetsChartWindDirection.push(datasets.windDirectionForecast);

	if (!Chart.instances[1])
		chartWindDirection = new Chart(
			canvasWindDirection,
			newChartOptions(datasetsChartWindDirection, optionsWindDirectionChart),
		);
	else {
		chartWindDirection = Chart.instances[1];

		chartWindDirection.data.labels = times;
		chartWindDirection.data.datasets = datasetsChartWindDirection;
		chartWindDirection.options = optionsWindDirectionChart;
		chartWindDirection.update();
	}

	//Setting light/dark mode colours
	chartWindSpeed.config.options.scales.x.grid.color =
		chartWindSpeed.config.options.scales.y.grid.color =
		chartWindDirection.config.options.scales.x.grid.color =
		chartWindDirection.config.options.scales.y.grid.color =
			getComputedStyle(document.body).getPropertyValue("--lineColour1");

	// Update the tooltips
	tooltipRenderer(chartWindSpeed);
	tooltipRenderer(chartWindDirection);
}

export function updateTable() {
	document.querySelector("main").style.overflow = "auto"; //Only needed for Safari browser

	graphNodeElements.forEach((element) => {
		element.classList.add("noDisplay");
	});
	tableNodeElements.forEach((element) => {
		element.classList.remove("noDisplay");
	});

	const tableHeaderRow = document.querySelector("[data-tableHeaderRow]");
	const table = document.querySelector("[data-dataTable]");

	const NoMeasurementTypesAvailable = [
		displayValues.windSpeed.length !== 0,
		displayValues.windGusts.length !== 0,
		displayValues.windDirection.length !== 0,
	].filter((array) => array !== false).length;
	document
		.querySelector("[data-dataTable] th:nth-child(2)")
		.setAttribute("colspan", NoMeasurementTypesAvailable);
	if (
		NoMeasurementTypesAvailable === 0 &&
		document.querySelector("[data-dataTable] th:nth-child(2)").innerText === "Metingen"
	)
		document.querySelector("[data-dataTable] th:nth-child(2)").classList.add("noDisplay");
	else document.querySelector("[data-dataTable] th:nth-child(2)").classList.remove("noDisplay");
	if (
		!displayValues.windSpeedForecast &&
		document.querySelector("[data-dataTable] th:nth-child(3)")
	)
		document.querySelector("[data-dataTable] th:nth-child(3)").remove();

	//Clearing table
	for (let i = 2; i < table.rows.length; ) table.deleteRow(i);
	tableHeaderRow.innerHTML = "";

	// Setting table values (first rows, then cells)
	const dataTypeArray = [
		"windSpeed",
		"windGusts",
		"windDirection",
		"windSpeedForecast",
		"windGustsForecast",
		"windDirectionForecast",
	];
	const headerTexts = {
		windSpeed: `sterkte [${unit}]`,
		windGusts: `vlagen [${unit}]`,
		windDirection: `richting [°]`,
		windSpeedForecast: `sterkte [${unit}]`,
		windGustsForecast: `vlagen [${unit}]`,
		windDirectionForecast: `richting [°]`,
	};
	dataTypeArray.forEach((dataType) => {
		if (displayValues[dataType] && displayValues[dataType].length !== 0)
			tableHeaderRow.innerHTML += `<th>${headerTexts[dataType]}</th>`;
	});

	let lengthLongestArray = Math.max(
		...[
			displayValues.windSpeed.length,
			displayValues.windGusts.length,
			displayValues.windDirection.length,
		],
	);
	if (lengthLongestArray === 0) lengthLongestArray = displayValues.windSpeedForecast.length;

	for (let i = 0; i < lengthLongestArray; i++) {
		const row = document.createElement("tr");

		const cellTime = document.createElement("td");
		cellTime.innerText = times[i];
		row.append(cellTime);

		dataTypeArray.forEach((dataType) => {
			const cell = document.createElement("td");
			if (displayValues[dataType]?.[i]) {
				cell.innerText = displayValues[dataType][i].replace(".", ",");
				row.append(cell);
			}
		});

		if (localStorage.getItem("tableSort") === "descending") tableHeaderRow.after(row);
		else if (localStorage.getItem("tableSort") === "ascending") table.append(row);
	}
}

// Helper functions for updateDisplayCurrentWind.js
import { higherLegend, tooltipLine } from "../js/objects/chartData.js";

function newChartOptions(datasets, options) {
	return {
		type: "line",
		data: {
			labels: times,
			datasets: datasets,
		},
		options: options,
		plugins: [tooltipLine, higherLegend],
	};
}

function checkInterpolated(ctx, dataType, value) {
	if (
		interpolatedIndices[dataType].includes(ctx.p0DataIndex + 1) ||
		interpolatedIndices[dataType].includes(ctx.p0DataIndex)
	)
		return value;
}
