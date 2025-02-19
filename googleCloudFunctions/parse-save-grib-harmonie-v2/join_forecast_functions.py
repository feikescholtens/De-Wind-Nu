from datetime import datetime



def join_old_and_new_forecast (old_forecast, new_forecast, force_update_forecast_with_older_run):
	
	# This function joins the old and new forecast data together
	
	# If the new forecast is not newer than the old forecast, the old forecast is returned,
	# unless the configuration is set to forcefully update the forecast with older runs
	# The function below checks this and returns the old forecast if necessary, or True if the new forecast should be parsed
	continue_or_return_old_forecast = continue_depending_on_state_of_old_forecast(old_forecast, new_forecast, force_update_forecast_with_older_run)
	if continue_or_return_old_forecast == True: pass
	else: return continue_or_return_old_forecast

	joined_forecast = {}
	
	for location_id, NEW_location_array in new_forecast.items(): # location_id: 8700, NEW_location_array: [{"date": "10-02-2025", "time: "12:00", "s": 15.1, "g": 20.1, "d": 142}, ...]
		if location_id == "timeRun": continue

		# Start with data from the new location array
		UPDATED_location_forecast_array = NEW_location_array.copy()  

		# Get the first interval date and time of the updated forecast
		first_interval_date = UPDATED_location_forecast_array[0]["date"]
		first_interval_time = UPDATED_location_forecast_array[0]["time"]
		index_first_updated_interval_in_old_forecast = get_index_first_updated_interval_in_old_forecast(first_interval_date, first_interval_time, old_forecast, location_id)
		# Strip the old forecast array from the first entry to the first updated time interval
		OLD_location_array_stripped_from_updated_times = strip_old_forecast_array(old_forecast, location_id, index_first_updated_interval_in_old_forecast)

		# Join the stripped old forecast array with the updated forecast array
		UPDATED_location_forecast_array = OLD_location_array_stripped_from_updated_times + UPDATED_location_forecast_array
		joined_forecast[location_id] = UPDATED_location_forecast_array
	
	joined_forecast["timeRun"] = new_forecast["timeRun"]
	return joined_forecast
















def continue_depending_on_state_of_old_forecast (old_forecast, new_forecast, force_update_forecast_with_older_run):
	# Check if time run in newer forecast is newer than that in old forecast. If this is NOT the case, and overwrite is set to False, return the old forecast
	# First check if there is old forecast data at all, otherwise error will be thrown
	
	if "timeRun" in old_forecast.keys():
		if old_forecast["timeRun"][-1] != "Z": old_forecast["timeRun"] = old_forecast["timeRun"] + "Z" # Whole line can be removed ones script v2 is fully operational
		datetime_run_old_forecast = datetime.fromisoformat(old_forecast["timeRun"])
		datetime_run_new_forecast = datetime.fromisoformat(new_forecast["timeRun"])
		
		if ((not datetime_run_new_forecast > datetime_run_old_forecast)
			and force_update_forecast_with_older_run == False): 
			print("Parsed forecast is not newer than old forecast, keeping the old forecast... Change configuration to forcefully overwrite this behaviour.")
			return old_forecast
	else:	print("Warning: there was no old forecast data, or it's retrieval failed. Continue parsing new forecast...")
	
	return True


















def get_index_first_updated_interval_in_old_forecast (first_interval_date, first_interval_time, old_forecast, location_id):
	# This function	returns the index of the first interval in the old forecast that is updated by the new forecast
	# Used for stripping the old forecast array from the first updated interval onwards
	# If the first interval is not found, None is returned (e.g. when the forecast is completely new)
	# If the old forecast is not found, None is returned

	if old_forecast == None or location_id not in old_forecast:		return None # If the old forecast is not found, return None
	if len(old_forecast[location_id]) == 0:			return None # If the old forecast is empty, return None

	OLD_location_array = old_forecast[location_id] # OLD_location_array: [{"date": "10-02-2025", "time: "00:00", "s": 12.1, "g": 13.1, "d": 156}, ...]
	for OLD_location_forecast_value in OLD_location_array: # OLD_location_forecast_value: {"date": "10-02-2025", "time: "12:00", "s": 15.1, "g": 20.1, "d": 142}
		if (OLD_location_forecast_value["date"] == first_interval_date and 
			OLD_location_forecast_value["time"] == first_interval_time):	
			return OLD_location_array.index(OLD_location_forecast_value)
		else:		continue





















def strip_old_forecast_array (old_forecast, location_id, index_first_updated_interval_in_old_forecast):
	# This function strips the old forecast array from the first updated interval onwards

	if index_first_updated_interval_in_old_forecast == None: 	return [] # If the first interval is not found, return an empty array
	if old_forecast == None or location_id not in old_forecast:		return [] # If the old forecast is not found, return None
	if len(old_forecast[location_id]) == 0: 	return [] # If the old forecast is empty, return an empty array

	OLD_location_array = old_forecast[location_id] # OLD_location_array: [{"date": "10-02-2025", "time: "00:00", "s": 12.1, "g": 13.1, "d": 156}, ...]
	OLD_location_array_stripped_from_updated_times = OLD_location_array[:index_first_updated_interval_in_old_forecast]

	return OLD_location_array_stripped_from_updated_times