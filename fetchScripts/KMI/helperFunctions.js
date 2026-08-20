import { subHours } from "date-fns";
import { getFetchDates } from "../fetchUtilFunctions.js";

export function composeUrl(requestType, KMI_ID = null, dateParsed = null, DSTDates = null) {
	let beginDate, endDate;

	const url = new URL("https://opendata.meteo.be/service/ows");

	url.searchParams.set("service", "WFS");
	url.searchParams.set("version", "2.0.0");
	url.searchParams.set("request", "GetFeature");
	url.searchParams.set("typenames", "aws:aws_10min");
	url.searchParams.set("outputformat", "application/json");
	if (requestType === "overview") {
		beginDate = subHours(new Date(), 1).toISOString(); // Look for measurements from the last hour
		endDate = new Date().toISOString(); // Look for measurements until now
		url.searchParams.set("CQL_FILTER", `timestamp >= '${beginDate}' AND timestamp <= '${endDate}'`);
	} else if (requestType === "day") {
		[beginDate, endDate] = getFetchDates(dateParsed, DSTDates);
		url.searchParams.set(
			"CQL_FILTER",
			`timestamp >= '${beginDate}' AND timestamp <= '${endDate}' AND code = '${KMI_ID}'`,
		);
	}
	url.searchParams.set("sortby", "timestamp");

	return url;
}
