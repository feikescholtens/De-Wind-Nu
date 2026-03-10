import { log } from "../../serverFunctions.js";
import { resolveEmptyArrays, resolveEmptyObject } from "../errorHandlingFunctions.js";

export function RWS_API_error(rawData, resolve, isOverview = false) {
	if (rawData.Foutmelding)
		log(`Rijkswaterstaat API "Succesvol"-error: ${rawData.Foutmelding}`, "error", true);

	if (!rawData.Succesvol) {
		if (isOverview) {
			resolveEmptyObject(resolve);
		} else {
			resolveEmptyArrays(resolve, "RWS");
		}
		return true;
	}

	return false;
}
