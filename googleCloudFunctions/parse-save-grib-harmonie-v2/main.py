import h5netcdf
from parse_functions import (parse_wind_speed_and_direction, 
                             parse_wind_gust, 
                             merge_parsed_wind_direction_gust)
from utility_functions import (get_webserver_address, 
                               get_path_like_objects_NetCDF_files, 
                               fetch_locations_to_parse, 
                               get_old_forecast, 
                               save_updated_forecast)
from join_forecast_functions import join_old_and_new_forecast
from datetime import datetime
import pytz

mode = "development" # production or development, e.g. to determine address of the webserver


# ---------------- Configuration parameters for development environment* -------------------------
# *in production environment these are overwriten by the ones in the request that calls main(...)
# ------------------------------------------------------------------------------------------------
force_parse_local_files = False 
# Set to True to parse local files (in test_NetCDF_files directory), 
# False to fetch the latest from the KNMI
# Using this parameter will probably needs force_update_forecast_with_older_run to be set
# to True as well, otherwise the requested behaviour will fail parsing local file with
# older model run
# -----------------------------------------------------------------------------------------
force_parse_certain_model_run = None
# Set to a certain model run to force parsing that model run, e.g. "20250203T09".
# To fetch the latest, set to None
# -----------------------------------------------------------------------------------------
quit_if_datetime_model_run_not_newer_KNMI = True 
# Only implies if two variables above are default, e.g. False and None. If True, 
# the script will immediately exit once filenames KNMI are fetched and a newer than 
# currently stored forecast run is not available yet
# -----------------------------------------------------------------------------------------
force_update_forecast_with_older_run = False 
# If an older model run is parsed than currently is in old_forecast, 
# should the script still update with the new/but actually outdated forecast?
# -----------------------------------------------------------------------------------------
use_local_JSON_for_getting_and_storing_forecasts = False 
# Instead of setting the data in the Firestore documents, 
# save them to JSON files in the test_input_and_output_forecasts directory
# Saving to Firestore will overwrite in the (hardcoded) bucket, JSON files will be kept
# seperate.
# -----------------------------------------------------------------------------------------
firestore_document_to_use = "Harmonie forecast today & future v2"
# The Firestore document to use for the forecast data, only used if 
# use_local_JSON_for_getting_and_storing_forecasts is set to False
# -----------------------------------------------------------------------------------------

def main (request):
    global force_parse_local_files, force_parse_certain_model_run, quit_if_datetime_model_run_not_newer_KNMI, force_update_forecast_with_older_run, use_local_JSON_for_getting_and_storing_forecasts, firestore_document_to_use
    if mode == "production": force_parse_local_files, force_parse_certain_model_run, quit_if_datetime_model_run_not_newer_KNMI, force_update_forecast_with_older_run, use_local_JSON_for_getting_and_storing_forecasts, firestore_document_to_use = request.get_json(silent=True)["config_parameters"]

    # -------- 1st part: getting the old forecast data (before parsing) ----------------------------
    
    old_forecast = get_old_forecast(use_local_JSON_for_getting_and_storing_forecasts, firestore_document_to_use)

    # -------- 2nd part: parsing the new forecast data (if available and configured to do so) ------

    # Get the URL of the webserver (Node JS)
    webserver_address = get_webserver_address(mode)

    # Configuration variables
    NO_decimals = 3 # Number of decimals to round the wind speed and gust to
    parse_method = "nearest" # linear, nearest or cubic. linear for production, nearest for testing, cubic if bored (takes VERY long)

    # Fetch the locations to parse from the webserver
    locations_to_parse = fetch_locations_to_parse(webserver_address)
    if (locations_to_parse == None):        return "Executed the script. Errors might still have occured. See logs for more details."
    # Location to test on, Oosterschelde
    # locations_to_parse = [{"id": "8700", "lat": 51.6558, "lon": 3.6939}]

    new_forecast_wind_and_direction = {}
    new_forecast_gust = {}

    # Get the path-like objects for the NetCDF data
    path_like_wind_direction, path_like_gust = get_path_like_objects_NetCDF_files(force_parse_local_files, force_parse_certain_model_run, old_forecast, quit_if_datetime_model_run_not_newer_KNMI)
    if path_like_wind_direction == None or path_like_gust == None:        return "Executed the script. Errors might still have occured. See logs for more details."

    # Reconstruct data of the wind speed and direction NetCDF data to the parsing functions
    with h5netcdf.File(path_like_wind_direction, "r") as ds_wind_direction:
        variables_names = ["latitude", "longitude", "x-wind-hagl", "y-wind-hagl", "time"]
        data_arrays = [ds_wind_direction.variables[variable][:] for variable in variables_names]
        
        # Get the reference time (time_run) from this dataset
        time_run_unix = ds_wind_direction.variables["forecast_reference_time"][()]
        time_run_ISO_string = datetime.fromtimestamp(time_run_unix, pytz.utc).isoformat().replace("+00:00", "Z")
        new_forecast_wind_and_direction["timeRun"] = time_run_ISO_string

        for parse_location in locations_to_parse:
            location_array_wind_direction = parse_wind_speed_and_direction(data_arrays, parse_location, parse_method, NO_decimals)
            if (len(location_array_wind_direction) != 0): # Location array is empty if the location is outside the grid
                new_forecast_wind_and_direction[parse_location["id"]] = location_array_wind_direction

    # Reconstruct data of the gust NetCDF data to the parsing functions
    with h5netcdf.File(path_like_gust, "r") as ds_gust:
        variables_names = ["latitude", "longitude", "wind-speed-of-gust-01h-hagl", "time"]
        data_arrays = [ds_gust.variables[variable][:] for variable in variables_names]

        for parse_location in locations_to_parse:
            location_array_gust = parse_wind_gust(data_arrays, parse_location, parse_method, NO_decimals)
            if (len(location_array_gust) != 0): # Location array is empty if the location is outside the grid
                new_forecast_gust[parse_location["id"]] = location_array_gust

    # Merge the parsed wind, direction and gust forecasts
    new_forecast = merge_parsed_wind_direction_gust(new_forecast_wind_and_direction, new_forecast_gust)

    # -------- 3rd part: joining the old and new forecast data and saving accordingly --------------

    # Join old and new forecast together
    updated_forecast = join_old_and_new_forecast(old_forecast, new_forecast, force_update_forecast_with_older_run)

    # Saving the updated forecast according to the configuration
    save_updated_forecast(updated_forecast, use_local_JSON_for_getting_and_storing_forecasts, firestore_document_to_use)

    return "Executed the script. Errors might still have occured. See logs for more details."

# Only needed for development environment; then the function won't be called automatically
if mode == "development":
    main([])