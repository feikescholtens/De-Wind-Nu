import numpy as np
from scipy.interpolate import RegularGridInterpolator
from time_utils import convert_unix_to_local_date_and_time, local_timezone





def parse_wind_speed_and_direction (ds, parse_location, method, NO_decimals):

	# Get ID and coordinates for location to parse
	location_id = parse_location["id"]
	parse_lat = parse_location["lat"]
	parse_lon = parse_location["lon"]

	# Get all dataset variables
	lat_coords 		= ds.variables["latitude"][:]
	lon_coords 		= ds.variables["longitude"][:]
	x_windspeed 	= ds.variables["x-wind-hagl"][:]
	y_windspeed 	= ds.variables["y-wind-hagl"][:]
	time_intervals	= ds.variables["time"][:]

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
		date_interval, time_interval = convert_unix_to_local_date_and_time(time_intervals[interval_hour], local_timezone)

		location_object = {
			"date": date_interval,
			"time": time_interval,
			"s": round(windspeed.item(), NO_decimals), # .item gets the value as regular python float
			"d": round(wind_direction)
		}
		location_array = np.append(location_array, location_object)

		# For debugging purposes
		# print(f"Wind speed at {parse_lat}, {parse_lon} (location {location_id}) at datetime {date_interval, time_interval}: {location_object["s"]} knots, direction: {location_object["d"]} degrees from North")

	return list(location_array)





def parse_wind_gust (ds, parse_location, method, NO_decimals):

	# Get ID and coordinates for location to parse
	location_id = parse_location["id"]
	parse_lat = parse_location["lat"]
	parse_lon = parse_location["lon"]

	# Get all dataset variables
	lat_coords 		= ds.variables["latitude"][:]
	lon_coords 		= ds.variables["longitude"][:]
	wind_gust		= ds.variables["wind-speed-of-gust-01h-hagl"][:]
	time_intervals	= ds.variables["time"][:]

	NO_time_intervals = len(time_intervals)
	location_array = np.array([])

	# Values are linearly interpolated between grid points
	for interval_hour in range(NO_time_intervals):
		interpolation_function = RegularGridInterpolator((lat_coords, lon_coords), wind_gust[interval_hour][0], method=method, bounds_error=False, fill_value=np.nan)
		
		gust = interpolation_function([parse_lat, parse_lon])[0] # knots
		date_interval, time_interval = convert_unix_to_local_date_and_time(time_intervals[interval_hour], local_timezone)
		
		location_object = {
			"date": date_interval,
			"time": time_interval,
			"g": round(gust.item(), NO_decimals), # .item gets the value as regular python float
		}
		location_array = np.append(location_array, location_object)

		# For debugging purposes
		# print(f"Max wind gust at {parse_lat}, {parse_lon} (location {location_id}) at datetime {date_interval, time_interval}: {location_object["g"]} knots")

	return list(location_array)






def merge_parsed_wind_direction_gust(wind_and_direction, gust):

    merged_forecast = {}
    # location_id: 8700, location_array_wind_and_direction: [{date: "03-02-2025", time: "09:00", s: 10.0, d: 180.0}, ...]
    for location_id, location_array_wind_and_direction in wind_and_direction.items():
        
        # location_array_gust: [{date: "03-02-2025", time: "09:00", g: 15.0}, ...] (all time intervals)
        location_array_gust = gust.get(location_id, [])
        
        # Merge the two arrays based on date and time
        merged_location_array = []
        # time_interval_xxxxxxxxxx: {date: "03-02-2025", time: "09:00", ... } (single time interval)
        for time_interval_wind_and_direction in location_array_wind_and_direction:
            for time_interval_gust in location_array_gust:
                
                # Match the two and merge them
                if (time_interval_wind_and_direction['date'] == time_interval_gust['date'] and 
                    time_interval_wind_and_direction['time'] == time_interval_gust['time']):

                    # time_interval_merged: {date: "03-02-2025", time: "09:00", s: 10.0, d: 180.0, g: 15.0}  (single time interval)
                    time_interval_merged = {**time_interval_wind_and_direction, **time_interval_gust}
                    # merged_location_array: [{date: "03-02-2025", time: "09:00", s: 10.0, d: 180.0, g: 15.0}, ...] (all time intervals)
                    merged_location_array.append(time_interval_merged)
        
        # Reconstruct the object for this location
        merged_forecast[location_id] = merged_location_array
    return merged_forecast