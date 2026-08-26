// --- Shared dataset styling ---

export const datasetObject = {
	borderWidth: 2,
	pointHoverBackgroundColor: "rgb(111, 111, 111)",
	pointHoverBorderWidth: 0,
	pointHoverRadius: 4,
};

export const datasetInfo = {
	windSpeed: {
		label: "Windsterkte",
		labelCode: "windSpeed",
		borderColor: "rgba(106, 176, 76, 1)",
		backgroundColor: "rgba(106, 176, 76, 0.4)",
	},
	windGusts: {
		label: "Windvlagen",
		labelCode: "windGusts",
		borderColor: "rgba(235, 77, 75, 1)",
		backgroundColor: "rgba(235, 77, 75, 0.4)",
	},
	windDirection: {
		label: "Windrichting",
		labelCode: "windDirection",
		borderColor: "rgba(95, 39, 205, 1)",
		backgroundColor: "rgba(95, 39, 205, 0.4)",
	},
	windSpeedForecast: {
		label: "Windsterkte verwachting",
		labelCode: "windSpeedForecast",
		borderColor: "rgba(46, 134, 222, 1)",
		backgroundColor: "rgba(46, 134, 222, 0.4)",
	},
	windGustsForecast: {
		label: "Windvlagen verwachting",
		labelCode: "windGustsForecast",
		borderColor: "rgba(255, 159, 243, 1)",
		backgroundColor: "rgba(255, 159, 243, 0.4)",
	},
	windDirectionForecast: {
		label: "Windrichting verwachting",
		labelCode: "windDirectionForecast",
		borderColor: "rgba(255, 159, 67, 1)",
		backgroundColor: "rgba(255, 159, 67, 0.4)",
	},
};

// --- Chart.js plugins ---

export const tooltipLine = {
	id: "tooltipLine",
	beforeDraw: (chart) => {
		if (chart.tooltip?.getActiveElements().length) {
			const ctx = chart.ctx;
			ctx.save();
			const activePoint = chart.tooltip.getActiveElements()[0];

			ctx.beginPath();
			ctx.setLineDash([5, 0]);
			ctx.moveTo(activePoint.element.x, chart.chartArea.top);
			ctx.lineTo(activePoint.element.x, chart.chartArea.bottom);
			ctx.lineWidth = 2;
			ctx.strokeStyle = "rgb(111, 111, 111)";
			ctx.stroke();
			ctx.restore();
		}
	},
};

export const higherLegend = {
	beforeInit(chart) {
		// Get a reference to the original fit function
		const originalFit = chart.legend.fit;

		// Override the fit function
		chart.legend.fit = function fit() {
			// Call the original function and bind scope in order to use `this` correctly inside it
			originalFit.bind(chart.legend)();
			// Change the height as suggested in other answers
			this.height += 50 + 10; // 50 is the height of the legend, 10 is the margin
		};
	},
};

// --- Tooltip rendering ---

export function tooltipRenderer(context) {
	const chart = context.chart ?? context;
	const tooltipEl = chart.canvas.previousElementSibling;
	if (!tooltipEl) return;

	const tooltipModel = context.tooltip;
	if (!tooltipModel) return;

	const itemUnit = chart.id === 0 ? unit : "°";

	// If user isn't hovering over the canvas, show the max values for the chosen day
	if (tooltipModel.opacity === 0) {
		renderDayMaxTooltip(tooltipEl, chart, itemUnit);
		// Else user is hovering over the canvas, show the values for the hovered time
	} else {
		renderHoverTooltip(tooltipEl, tooltipModel, itemUnit);
	}

	// Display, position, and set styles for font
	tooltipEl.style.top = `${chart.canvas.offsetTop + chart.legend.bottom - 50 - 15}px`;
	tooltipEl.style.opacity = 1;
}

function renderDayMaxTooltip(tooltipEl, chart, itemUnit) {
	const isDirection = itemUnit === "°";
	const dateRelative = document.querySelector("[data-currentDay]").innerText;
	const label = isDirection ? "Gemiddelde windrichting" : "Maximale wind";
	tooltipEl.querySelector("p").innerHTML = `${label} op deze dag (${dateRelative.toLowerCase()}): `;

	const dataLines = chart?.data?.datasets;
	if (!dataLines) return;

	const hiddenDatasets = JSON.parse(localStorage.getItem("hiddenDatasets")) || {};
	const visibleDataLines = dataLines.filter((dataLine) => !hiddenDatasets[dataLine.label]);

	const items = visibleDataLines.map((dataLine) => {
		const validValues = dataLine.data.filter((s) => !Number.isNaN(Number(s)));
		const value = isDirection ? meanDirection(validValues) : maxValue(validValues);

		return {
			value: value?.toString().replace(".", ","),
			bgColour: dataLine.backgroundColor,
			borderColour: dataLine.borderColor,
		};
	});

	renderTooltipItems(tooltipEl, items, itemUnit);
}

function maxValue(values) {
	return values.length ? values.reduce((max, c) => (Number(c) > Number(max) ? c : max)) : undefined;
}

function meanDirection(values) {
	if (!values.length) return undefined;

	const radians = values.map((v) => (Number(v) * Math.PI) / 180);
	const sumSin = radians.reduce((sum, r) => sum + Math.sin(r), 0);
	const sumCos = radians.reduce((sum, r) => sum + Math.cos(r), 0);
	const meanDeg = (Math.atan2(sumSin, sumCos) * 180) / Math.PI;

	return Math.round((meanDeg + 360) % 360) % 360;
}

function renderHoverTooltip(tooltipEl, tooltipModel, itemUnit) {
	const titles = tooltipModel.title || [];
	tooltipEl.querySelector("p").innerHTML =
		`Wind ter plaatse van de lijn, ${titles[0].toLowerCase()}:`;

	const items = tooltipModel.dataPoints.map((body) => ({
		value: body.raw.replace(".", ","),
		bgColour: body.dataset.backgroundColor,
		borderColour: body.dataset.borderColor,
	}));

	renderTooltipItems(tooltipEl, items, itemUnit);
}

function renderTooltipItems(tooltipEl, items, itemUnit) {
	const html = items
		.map(
			({ value, bgColour, borderColour }) => `<div class="tooltipItem">
								<div style="
										background-color: ${bgColour};
										border: 3px solid ${borderColour};"
									class="box"></div>${value} ${itemUnit}
								</div>`,
		)
		.join("");

	tooltipEl.querySelector(".tooltipItems").innerHTML = html;
}

// --- Interaction handlers ---

function onLegendClick(event, element) {
	const datasetIndex = element.datasetIndex;
	let datasetName = element.text.split("|")[0];
	if (datasetName[datasetName.length - 1] === " ") datasetName = datasetName.slice(0, -1);

	const hiddenDatasets = JSON.parse(localStorage.getItem("hiddenDatasets"));

	if (event.chart.data.datasets[datasetIndex].hidden) {
		event.chart.data.datasets[datasetIndex].hidden = false;

		hiddenDatasets[datasetName] = false;
	} else {
		event.chart.data.datasets[datasetIndex].hidden = true;

		hiddenDatasets[datasetName] = true;
	}

	localStorage.setItem("hiddenDatasets", JSON.stringify(hiddenDatasets));
	event.chart.update();
	tooltipRenderer(event.chart);
}

function setTitle(context) {
	if (context[0].dataIndex === times.length - 1) return `${dateTomorrow} om ${context[0].label}`;
	else return `${date} om ${context[0].label}`;
}

// --- Chart options ---

export const optionsWindSpeedChart = {
	scales: {
		y: {
			display: true,
			title: {
				display: true,
				font: {
					family: "Lato",
					size: 14,
				},
			},
			beginAtZero: true,
			ticks: {
				font: {
					family: "Lato",
				},
			},
			suggestedMax: 16,
		},
		x: {
			ticks: {
				font: {
					family: "Lato",
				},
				maxTicksLimit: () => {
					if (document.body.clientWidth < 500) return 13;
					else return 25;
				},
			},
		},
	},
	radius: 0,
	tension: 0.3,
	interaction: {
		mode: "index",
		intersect: false,
	},
	plugins: {
		legend: {
			labels: {
				font: {
					size: 14,
					family: "Lato",
					weight: 500,
				},
			},
			onClick: undefined,
		},
		tooltip: {
			enabled: false, // Disable the default tooltip
			callbacks: {
				title: undefined, // Assigned later
			},
			external: undefined, // Assigned later
		},
	},
};

export const optionsWindDirectionChart = JSON.parse(JSON.stringify(optionsWindSpeedChart)); //Watch out functions don't get cloned using this method
optionsWindDirectionChart.scales.y.title.text = "Windrichting [°]";
optionsWindDirectionChart.scales.y.max = 360;
optionsWindDirectionChart.scales.y.min = 0;
optionsWindDirectionChart.scales.y.ticks = {
	stepSize: 22.5,
	callback: (value) => {
		return value.toString().replace(".", ",");
	},
};
optionsWindDirectionChart.scales.x.ticks.maxTicksLimit = () => {
	if (document.body.clientWidth < 500) return 13;
	else return 25;
};

optionsWindSpeedChart.plugins.legend.onClick = (event, element) => onLegendClick(event, element);
optionsWindDirectionChart.plugins.legend.onClick = (event, element) =>
	onLegendClick(event, element);

optionsWindSpeedChart.plugins.tooltip.external = (context) => tooltipRenderer(context);
optionsWindDirectionChart.plugins.tooltip.external = (context) => tooltipRenderer(context);

optionsWindSpeedChart.plugins.tooltip.callbacks.title = (context) => setTitle(context);
optionsWindDirectionChart.plugins.tooltip.callbacks.title = (context) => setTitle(context);
