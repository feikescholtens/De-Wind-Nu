from requests import get
import os
import glob
import os
import sys
from KNMI_fetch_functions import fetch_latest_NetCDF_filenames_KNMI, fetch_NetCDF_files_KNMI
from datetime import datetime
from google.cloud import firestore
import json

# Change the working directory to the location of this script
os.chdir(os.path.dirname(os.path.realpath(sys.argv[0])))




















def get_webserver_address(mode):
	# Determine the address of the webserver, depending on the mode
	if mode == "production":
		webserver_address = "https://de-wind-nu-test.ew.r.appspot.com"
	elif mode == "development":
		webserver_address = "http://localhost:3000"
																										
	return webserver_address














def fetch_locations_to_parse(webserver_address):
	# Fetch the locations to parse from the webserver
	try:
		response = get(f"{webserver_address}/giveLocationsParsingHarmonie")
		response.raise_for_status()  # Raise an HTTPError for bad responses
		locations_to_parse = response.json()

		return locations_to_parse
	except Exception as e:
		print(f"Fetching locations from webserver failed with error (function {sys._getframe().f_code.co_name}): {e}")
		return


















def get_path_like_objects_NetCDF_files (force_parse_local_files, force_parse_certain_model_run, old_forecast, quit_if_datetime_model_run_not_newer_KNMI):
	
	if force_parse_local_files == True:
		# Use the files in the test_NetCDF_files directory, don't fetch any files from the KNMI.
		# Variables are returned as file path strings

		directory_test_files = "test_NetCDF_files"

		# File paths for the NetCDF files, first for wind speed (s) and direction (d), second for wind gust (g)
		try:
			path_like_wind_direction = glob.glob(f"{directory_test_files}/*wind-speed-components-hagl*")[0]
			path_like_gust = glob.glob(f"{directory_test_files}/*wind-speed-of-gust-01h-hagl*")[0]
		except Exception as e:
			path_like_wind_direction = path_like_gust = None
			print(f"Determining local NetCDF file paths failed with error (function {sys._getframe().f_code.co_name}): {e}. Are the files in the test_NetCDF_files directory?")
		
	elif force_parse_local_files == False:
		# Fetch NetCDF files from the KNMI, depending on the config
		# Variables are returned as BytesIO objects

		if force_parse_certain_model_run != None: 
			# The filenames for this modelrun are as follows
			file_name_wind_direction = f"uwcw_ha43_nl_2km_wind-speed-components-hagl_{force_parse_certain_model_run}.nc"
			file_name_gust = f"uwcw_ha43_nl_2km_wind-speed-of-gust-01h-hagl_{force_parse_certain_model_run}.nc"
		elif force_parse_certain_model_run == None:
			# The files for the latest model run are fetched
			file_name_wind_direction, file_name_gust, latest_model_run_datetime = fetch_latest_NetCDF_filenames_KNMI()
			if file_name_wind_direction == None or file_name_gust == None:		return None, None
			
			# Check if the date time of these fetched files is newer than the one already stored. Of not, quit immediately (if configured so)
			if "timeRun" in old_forecast.keys():
				if old_forecast["timeRun"][-1] != "Z": old_forecast["timeRun"] = old_forecast["timeRun"] + "Z" # Whole line can be removed ones script v2 is fully operational
				datetime_old_forecast_model_run = datetime.fromisoformat(old_forecast["timeRun"])

				if (quit_if_datetime_model_run_not_newer_KNMI == True and 
				(not latest_model_run_datetime > datetime_old_forecast_model_run)):
					print("Model run of last NetCDF files from KNMI is not newer than already stored. Keeping the old forecast data unchanged, configure for other behaviour.")
					return None, None

		# Fetch the files (either being the latest or a certain, given, model run) from the KNMI as BytesIO objects
		path_like_wind_direction, path_like_gust = fetch_NetCDF_files_KNMI(file_name_wind_direction, file_name_gust)
	
	return path_like_wind_direction, path_like_gust



















def get_old_forecast (use_local_JSON_for_getting_and_storing_forecasts, firestore_document_to_use):
	# Connect to Firestore database
	db = firestore.Client(project="de-wind-nu")
	document = db.collection(firestore_document_to_use).document("document")

	if use_local_JSON_for_getting_and_storing_forecasts == True:
		# Open and read the JSON file
		try:
			with open("test_input_and_output_forecasts/forecast_before_parsing.json", "r") as file:
				data = json.load(file)
				return data
		except Exception as e:
			print(f"Failed to get local JSON data for old_forecast data, failed with error: {e}")
			return {}
		
	if use_local_JSON_for_getting_and_storing_forecasts == False:
		# Get data from Firestore document
		data = document.get().to_dict()
		if (data == None): 
			print("Failed to get data for old_forecast from Google Firestore, the data retrieved is equal to None. Check the database by hand?")
			return {}
		return data
	

















def save_updated_forecast (updated_forecast, use_local_JSON_for_getting_and_storing_forecasts, firestore_document_to_use):
	# Connect to Firestore database
	db = firestore.Client(project="de-wind-nu")
	document = db.collection(firestore_document_to_use).document("document")

	if use_local_JSON_for_getting_and_storing_forecasts == True:
		# Open and write the JSON file
		try:
			with open("test_input_and_output_forecasts/forecast_after_parsing.json", "w") as file:
				json.dump(updated_forecast, file, indent=4)
		except Exception as e:
			print(f"Failed to get save JSON data for updated_forecast data, failed with error: {e}")
		
	if use_local_JSON_for_getting_and_storing_forecasts == False:
		# Save data to Firestore document
		document.set(updated_forecast)