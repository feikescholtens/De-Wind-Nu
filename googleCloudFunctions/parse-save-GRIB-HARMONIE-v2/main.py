import os
import h5netcdf
from parse_functions import parse_wind_speed_and_direction, parse_wind_gust, merge_parsed_wind_direction_gust
from utility_functions import log_node_app_message, set_variables_for_current_environment, fetch_locations_to_parse

#THIS NEEDS TO BE CLEANED UP BEFORE PRODUCTION
os.environ["GCP_LOGGER_KEY"] = "bc709dff-0c2c-4d4c-8b01-17d4cd3e5122"
import time
start_time = time.time()

# Set the mode to production or development, needed for some variables such as the address of the webserver
mode = "development" # production or development, e.g. to determine address of the webserver
webserver_address = set_variables_for_current_environment(mode)

# Change the working directory to the location of this script
if (os.getcwd().endswith("googleCloudFunctions/parse-save-GRIB-HARMONIE-v2") == False):
    os.chdir(f"{os.getcwd()}/googleCloudFunctions/parse-save-GRIB-HARMONIE-v2")

# Fetch the locations to parse from the webserver
locations_to_parse = fetch_locations_to_parse(webserver_address)
# Location to test on, Oostschelde
locations_to_parse = [{"id": "8700", "lat": 51.6558, "lon": 3.6939}]

# File paths for the NetCDF files, first for wind speed (s) and direction (d), second for wind gust (g)
path_file_wind_direction = "uwcw_ha43_nl_2km_wind-speed-components-hagl_20250203T09.nc"  # Change this to your file path
path_file_gust = "uwcw_ha43_nl_2km_wind-speed-of-gust-01h-hagl_20250203T09.nc"  # Change this to your file path

# Some parameters for the parsing functions
NO_decimals = 1 # Number of decimals to round the wind speed and gust to
parse_method = "nearest" # linear, nearest or cubic. linear for production, nearest for testing, cubic if bored (takes very long)

new_forecast_wind_and_direction = {}
new_forecast_gust = {}

# Open the wind components NetCDF file in read mode
with h5netcdf.File(path_file_wind_direction, "r") as ds_wind_direction:
    for parse_location in locations_to_parse:
        location_array_wind_direction = parse_wind_speed_and_direction(ds_wind_direction, parse_location, parse_method, NO_decimals)
        new_forecast_wind_and_direction[parse_location["id"]] = location_array_wind_direction

# Open the wind gust NetCDF file in read mode
with h5netcdf.File(path_file_gust, "r") as ds_gust:
    for parse_location in locations_to_parse:
        location_array_gust = parse_wind_gust(ds_gust, parse_location, parse_method, NO_decimals)
        new_forecast_gust[parse_location["id"]] = location_array_gust

# print(new_forecast_wind_and_direction)
# print(new_forecast_gust)

print("--- %s seconds ---" % (time.time() - start_time))



# Merge the parsed wind, direction and gust forecasts
# new_forecast = merge_parsed_wind_direction_gust(new_forecast_wind_and_direction, new_forecast_gust)
# print(new_forecast)


# 180.84288382530212 seconds for all locations
# ~ 1.00 seconds for a single location
# takes way too long, need to find a way to speed this up