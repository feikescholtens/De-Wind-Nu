import { parse } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { log } from "../../serverFunctions.js";
import { resolveEmptyArrays } from "../errorHandlingFunctions.js";

export function VLINDER_API_error(rawData, resolve) {
	if (rawData.error) {
		log(`VLINDER API error: "${rawData.error}"`, "error", true);
		resolveEmptyArrays(resolve, "VLINDER");
		return true;
	}

	return false;
}

export function VLINDER_dateStringToLocalHHmm(VLINDER_string, measurementTimes) {
	const dateOBJ_UTC = parse(
		`${VLINDER_string.substring(5, VLINDER_string.length - 4)} Z`,
		"dd MMM yyyy HH:mm:ss X",
		new Date(),
	);
	let timeFormatted = formatInTimeZone(dateOBJ_UTC, global.userTimeZone, "HH:mm");

	if (timeFormatted === "00:00" && measurementTimes.length > 0) timeFormatted = "00:00_nextDay";
	return timeFormatted;
}
