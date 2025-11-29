import { log } from "../../serverFunctions.js";
import { resolveEmptyArrays } from "../errorHandlingFunctions.js";

export function RWS_API_error(rawData, resolve) {
	if (rawData.Foutmelding)
		log(`Rijkswaterstaat API "Succesvol"-error: ${rawData.Foutmelding}`, "error", true);

	if (!rawData.Succesvol) {
		resolveEmptyArrays(resolve, "RWS");
		return true;
	}

	return false;
}
