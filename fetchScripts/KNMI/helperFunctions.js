import { log } from "../../serverFunctions.js";
import { resolveEmptyArrays, resolveEmptyObject } from "../errorHandlingFunctions.js";

export function KNMI_API_error(rawData, resolve, isOverview = false) {
	//Both used for overviewdata as data, overviewdata gives "detail" field in returned JSON, data gives "error" field in returned JSON

	if (rawData.error || rawData.detail) {
		log(
			`KNMI API error: "${JSON.stringify(rawData.error) || JSON.stringify(rawData.detail)}"`,
			"error",
			true,
		);
		if (isOverview) {
			resolveEmptyObject(resolve);
		} else {
			resolveEmptyArrays(resolve, "KNMI");
		}
		return true;
	}

	return false;
}
