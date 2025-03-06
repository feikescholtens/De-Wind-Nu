import numpy as np
from scipy.interpolate import RegularGridInterpolator
from time_utils import convert_unix_to_local_date_and_time, convert_unix_to_local_date_obj

















def parse_wind_speed_and_direction (data_arrays, parse_location, method, NO_decimals, dont_update_already_archived_intervals, date_today_local_time):

	# Get ID and coordinates for location to parse
	location_id = parse_location["id"]
	parse_lat = parse_location["lat"]
	parse_lon = parse_location["lon"]

	# Get all dataset variables
	lat_coords, lon_coords, x_windspeed, y_windspeed, time_intervals = data_arrays

	NO_time_intervals = len(time_intervals)
	location_array = np.array([])

	# Values are linearly interpolated between grid points
	for interval_hour in range(NO_time_intervals):
		interpolation_function_x = RegularGridInterpolator((lat_coords, lon_coords), x_windspeed[interval_hour][0], method=method, bounds_error=False, fill_value=np.nan)
		interpolation_function_y = RegularGridInterpolator((lat_coords, lon_coords), y_windspeed[interval_hour][0], method=method, bounds_error=False, fill_value=np.nan)

		x_vector = interpolation_function_x([parse_lat, parse_lon])[0] # knots
		y_vector = interpolation_function_y([parse_lat, parse_lon])[0] # knots
		
		# If any value from the interpolation is NaN, return an empty array. The location is probably outside the grid
		if (np.isnan([x_vector, y_vector]).any()):
			return []

		windspeed = np.sqrt(x_vector**2 + y_vector**2) # knots
		wind_direction = (np.degrees(np.arctan2(x_vector, y_vector)) + 180) % 360 # degrees from North, increasing clockwise
		date_interval, time_interval = convert_unix_to_local_date_and_time(time_intervals[interval_hour])

		location_object = {
			"date": date_interval,
			"time": time_interval,
			"s": round(windspeed.item(), NO_decimals), # .item gets the value as regular python float
			"d": round(wind_direction)
		}

		# We, if configured so by the dont_update_already_archived_intervals variable, only want to keep the forecast data that is not in the past, so we skip the data that is older than the current date
		# See also comments in main.py under variable force_update_forecast_with_older_run
		date_interval_obj = convert_unix_to_local_date_obj(time_intervals[interval_hour])
		if (dont_update_already_archived_intervals == True and date_interval_obj < date_today_local_time): continue

		location_array = np.append(location_array, location_object)

		# For debugging purposes
		# print(f"Wind speed at {parse_lat}, {parse_lon} (location {location_id}) at datetime {date_interval, time_interval}: {location_object["s"]} knots, direction: {location_object["d"]} degrees from North")

	return list(location_array)













def parse_wind_gust (data_arrays, parse_location, method, NO_decimals, dont_update_already_archived_intervals, date_today_local_time):

	# Get ID and coordinates for location to parse
	location_id = parse_location["id"]
	parse_lat = parse_location["lat"]
	parse_lon = parse_location["lon"]

	# Get all dataset variables
	lat_coords, lon_coords, wind_gust, time_intervals = data_arrays

	NO_time_intervals = len(time_intervals)
	location_array = np.array([])

	# Values are linearly interpolated between grid points
	for interval_hour in range(NO_time_intervals):
		interpolation_function = RegularGridInterpolator((lat_coords, lon_coords), wind_gust[interval_hour][0], method=method, bounds_error=False, fill_value=np.nan)
		
		gust = interpolation_function([parse_lat, parse_lon])[0] # knots
		
		# If any value from the interpolation is NaN, return an empty array. The location is probably outside the grid
		if (np.isnan(gust)):
			return []

		date_interval, time_interval = convert_unix_to_local_date_and_time(time_intervals[interval_hour])
		
		location_object = {
			"date": date_interval,
			"time": time_interval,
			"g": round(gust.item(), NO_decimals), # .item gets the value as regular python float
		}

		# We, if configured so by the dont_update_already_archived_intervals variable, only want to keep the forecast data that is not in the past, so we skip the data that is older than the current date
		# See also comments in main.py under variable force_update_forecast_with_older_run
		date_interval_obj = convert_unix_to_local_date_obj(time_intervals[interval_hour])
		if (dont_update_already_archived_intervals == True and date_interval_obj < date_today_local_time): continue
		
		location_array = np.append(location_array, location_object)

		# For debugging purposes
		# print(f"Max wind gust at {parse_lat}, {parse_lon} (location {location_id}) at datetime {date_interval, time_interval}: {location_object["g"]} knots")

	return list(location_array)















def merge_parsed_wind_direction_gust(wind_and_direction, gust):

	merged_forecast = {"timeRun": wind_and_direction["timeRun"]}
	
	# location_id: 8700, location_array_wind_and_direction: [{date: "03-02-2025", time: "09:00", s: 10.0, d: 180.0}, ...]
	for location_id, location_array_wind_and_direction in wind_and_direction.items():
		
		if location_id == "timeRun": continue

		# location_array_gust: [{date: "03-02-2025", time: "09:00", g: 15.0}, ...] (all time intervals)
		location_array_gust = gust.get(location_id, [])
		
		# Merge the two arrays based on date and time
		merged_location_array = []
		# time_interval_xxxxxxxxxx: {date: "03-02-2025", time: "09:00", ... } (single time interval)
		for time_interval_wind_and_direction in location_array_wind_and_direction:
			for time_interval_gust in location_array_gust:
				
				# Match the two and merge them
				if (time_interval_wind_and_direction["date"] == time_interval_gust["date"] and 
					time_interval_wind_and_direction["time"] == time_interval_gust["time"]):

					# time_interval_merged: {date: "03-02-2025", time: "09:00", s: 10.0, d: 180.0, g: 15.0}  (single time interval)
					time_interval_merged = {**time_interval_wind_and_direction, **time_interval_gust}
					# merged_location_array: [{date: "03-02-2025", time: "09:00", s: 10.0, d: 180.0, g: 15.0}, ...] (all time intervals)
					merged_location_array.append(time_interval_merged)
		
		merged_location_array = remove_wrong_DST_intervals(merged_location_array)
		
		# Reconstruct the object for this location
		merged_forecast[location_id] = merged_location_array
	return merged_forecast


















def remove_wrong_DST_intervals (merged_location_array):
	# Removes the wrong 02:00 intervals from the array
	# Because of switching from DST (to wintertime) , the 02:00 interval occurs twice in the arrays for windspeed&direction and gust
	# and 4 times in the merged array
	# Switching to DST (to summertime) is not a problem, because the 02:00 interval doesn't exist on this day
	
	indices_0200_interval = [] # [5, 6, 7, 8]

	# Find all indices of the 02:00 intervals that occur 4 times in the array
	date_counts = {}
	for entry in merged_location_array:
		date = entry["date"]
		if entry["time"] == "02:00":
			date_counts[date] = date_counts.get(date, 0) + 1
	for i, entry in enumerate(merged_location_array):
		if entry["time"] == "02:00" and date_counts[entry["date"]] > 1:
			indices_0200_interval.append(i)

	# Keep the first and last 02:00 interval in the array, remove the middle 2 (these are incorrectly matched)
	indices_to_remove = indices_0200_interval[1:-1]
	for index in sorted(indices_to_remove, reverse=True):
		del merged_location_array[index]

	return merged_location_array