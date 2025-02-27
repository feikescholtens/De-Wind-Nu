from utility_functions import (determine_split_date,
						get_unique_dates,
						check_split_date_in_past)
from get_save_forecast_functions import (get_forecast,
										 save_archive_forecast,
									 save_NEW_forecast_today_future)
from pathlib import Path
import shutil


mode = "development" # production or development


# ---------------- Configuration parameters for development environment* -------------------------
# *in production environment these are overwriten by the ones in the request that calls main(...)
# ------------------------------------------------------------------------------------------------
use_local_JSON_for_getting_and_storing_forecasts = True 
# Instead of setting the data in the Firestore documents, 
# save them to JSON files in the test_input_and_output_forecasts directory
# Saving to Firestore will overwrite in the (hardcoded) bucket, JSON files will be kept
# seperate.
# -----------------------------------------------------------------------------------------
dont_archive_forecast_only_strip_dates_yesterday = False
# If True, the forecast data will not be archived, only the data for yesterday will be 
# stripped (equivalent to the old  deleteForecastYesterday(-v2) function)
# -----------------------------------------------------------------------------------------
overwrite_split_date_with = "27-02-2025"
# The split date is the date for which days equal or after will be stored in the 
# "Harmonie forecast today & future" doucment, for days before the data will be stored 
# in the archive
# If False, the split date will be determined by the current date
# If set to a string (in format "DD-MM-YYYY"), the split date will be set to that date
# -----------------------------------------------------------------------------------------
firestore_document_today_future = "Harmonie forecast today & future v2"
# The Firestore document to use for the forecast data, only used if 
# use_local_JSON_for_getting_and_storing_forecasts is set to False
# -----------------------------------------------------------------------------------------
firestore_document_archive = "Harmonie forecast archive v2_testing_only"
# The Firestore document to use for the forecast data, only used if 
# use_local_JSON_for_getting_and_storing_forecasts is set to False
# Since Firestore document can't be renamed, this is a new document for testing purposes
# For production, this should be set to "Harmonie forecast archive"
# -----------------------------------------------------------------------------------------


def main (request):
	global use_local_JSON_for_getting_and_storing_forecasts, dont_archive_forecast_only_strip_dates_yesterday, overwrite_split_date_with, firestore_document_today_future, firestore_document_archive
	if mode == "production": use_local_JSON_for_getting_and_storing_forecasts, dont_archive_forecast_only_strip_dates_yesterday, overwrite_split_date_with, firestore_document_today_future, firestore_document_archive = request.get_json(silent=True)["config_parameters"]

	# -------------------- 1st part: getting the forecast data, prepairing variables -----------------------------------------------------

	# Get the forecast data from today and the future
	forecast_today_future = get_forecast(use_local_JSON_for_getting_and_storing_forecasts, firestore_document_today_future)
	if forecast_today_future == None: return "An error occured, see logs."

	# Object to store the new forecast data for today and the future in  AND  object for the archive
	per_day_forecast_to_archive = {}
	NEW_forecast_today_future = {"timeRun": forecast_today_future["timeRun"]}

	# In production this will be the current date/date of today, in development this can be an other date (e.g. for testing)
	split_date = determine_split_date(overwrite_split_date_with)
	if split_date == None: return "An error occured, see logs."

	# -------------------- 2nd part: reconstruct the forecast data into two objects ------------------------------------------------------

	# Location based, because the amount of intervals can differ per location (e.g. when a new location is added)
	for location_id, location_array in forecast_today_future.items(): # location_id: 8700, location_array: [{"date": "10-02-2025", "time: "12:00", "s": 15.1, "g": 20.1, "d": 142}, ...]
		if location_id == "timeRun": continue
		if len(location_array) == 0: continue

		unique_dates_location = get_unique_dates(location_array) # [['18-02-2025', 8], ['19-02-2025', 24], ['20-02-2025', 24], ['21-02-2025', 7]]
		skip_splitting = check_split_date_in_past(split_date, unique_dates_location)

		for date, count in unique_dates_location: # date: 18-02-2025, count: 8
			# From the split_date and on, the data will be stored in the "Harmonie forecast today & future" document
			if date == split_date: break
			if skip_splitting == True: break # This was placed here to avoid an extra if statement before the loop

			# Location array trimmed for day: date
			day_location_array = location_array[:count]
			# Remove the data from day: date from the location_array
			location_array = location_array[count:]
			
			# Add the data to the archive object
			if date not in per_day_forecast_to_archive: per_day_forecast_to_archive[date] = {}
			per_day_forecast_to_archive[date][location_id] = day_location_array

		# The data left in the location_array is the data for today and the future, save that in part 3
		NEW_forecast_today_future[location_id] = location_array

	# -------------------- 3rd part: save the archive forecast AND the new forecast data for today and the future  ----------------------------

	if dont_archive_forecast_only_strip_dates_yesterday != True: save_archive_forecast(per_day_forecast_to_archive, use_local_JSON_for_getting_and_storing_forecasts, firestore_document_archive)
	save_NEW_forecast_today_future(NEW_forecast_today_future, use_local_JSON_for_getting_and_storing_forecasts, firestore_document_today_future)

	return "Executed the script. Errors might still have occured. See logs for more details."




# Only needed for development environment; then the function won't be called automatically
if mode == "development":
    main([])
    if Path("__pycache__").exists() and Path("__pycache__").is_dir(): shutil.rmtree(Path("__pycache__"))