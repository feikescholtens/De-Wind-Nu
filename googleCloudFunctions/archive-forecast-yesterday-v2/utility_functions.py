from datetime import datetime
import pytz


timezone_obj = pytz.timezone("Europe/Amsterdam")




















def determine_split_date (overwrite_split_date_with):
	# If the split date is overwritten, return that
	if type(overwrite_split_date_with) is str: return overwrite_split_date_with
	
	# If the overwrite_split_date_with parameter is not a string, nor False, print a message and return None
	if (type(overwrite_split_date_with) is not str) and (overwrite_split_date_with != False): 
		print("The overwrite_split_date_with parameter is not a string, nor False. Script will exit.")
		return
	
	# If the split date is not overwritten, return the current date (date of today/date the script was run on). EVERYTHING IN LOCAL TIME (Europe/Amsterdam)
	if overwrite_split_date_with == False:
		# Get the current date
		date_obj_today = datetime.now(timezone_obj)
		date_today = date_obj_today.strftime("%d-%m-%Y")
		return date_today
	























def get_unique_dates(location_array):
    date_count = {}
    for location_interval in location_array:
        date = location_interval["date"]
        if date in date_count:
            date_count[date] += 1
        else:
            date_count[date] = 1
    
    unique_dates = [[date, count] for date, count in date_count.items()]
    return unique_dates




















def check_split_date_in_past(split_date, unique_dates_location):
	# Splitting doesn't need and MUST not be done if the split_date is in the past 
	# (i.e. ALL dates in the location_array are newer than the split_date)
	# Then this function returns True, causing the loop to break and all forecast data
	# to be stored in the "Harmonie forecast today & future" document

	dates_in_location_array = [date for date, count in unique_dates_location] # ['18-02-2025', '19-02-2025', '20-02-2025', '21-02-2025']

	# If the split_date is in unique_dates_location, splitting must take place so return False
	if split_date in dates_in_location_array: return False

	# From here in this function, the split_date is outside of the dates in the location_array
	
	# Makes a datetime object with the timezone UTC (for comparing, the local timezone doesn't need to be used)
	split_date_obj = datetime.strptime(split_date + " +0000", "%d-%m-%Y  %z")
	dates_in_location_array_objs = [datetime.strptime(date + " +0000", "%d-%m-%Y  %z") for date in dates_in_location_array]

	if (split_date_obj > max(dates_in_location_array_objs)): return False
	if (split_date_obj < min(dates_in_location_array_objs)): return True
