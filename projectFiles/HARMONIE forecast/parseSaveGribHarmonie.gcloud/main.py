from requests import get, post
import os
from google.cloud import firestore
import json
from datetime import datetime
from datetime import timedelta
from dateutil.parser import parse
from lxml import html
import pupygrib
import numpy as np
from io import BytesIO
import pytz

# For development purposes, when set to true, the script will fetch the forecast and print it, but not save it
print_only = False
#For	development purposes, when set to true, the script will save the forecast to a test document
save_test_document = False

# Function to log messages to the logging feature of the webserver
def log_node_app_message(message, Type, add_time_stamp):
	print(message)

	body = {
		"message": f"[GCP] {message}",
		"type": Type,
		"addTimeStamp": add_time_stamp
	}
	response = post("https://dewindnu.nl/logGCPMessage", json=body, headers={"Content-Type": "application/json", "Authorization": os.environ.get("GCP_LOGGER_KEY")})
	if (response.status_code != 200):
		print(response)

# Set timezone for the script execution
os.environ["TZ"] = "Europe/Amsterdam"
timezone = pytz.timezone("Europe/Amsterdam")

# Load locations from the JSON file, locations from 9 october 2023
locations = json.load(open("locations.json"))
project_id_and_bucket = "de-wind-nu"

# Main function that runs the forecast update process
def main (event, context):
	global print_only, save_test_document

	# Check if the function is forced to fetch, even if there won't be a new 
	# forecast run available, and save the forecast
	if "data" in event:
		force_fetch_and_save = True
		if (event["data"] == "forceSave"):
			print("Fetching and saving forecast regardless of the state of data in bucket!")
		elif (event["data"] == "printOnly"):
			print_only = True
			print("Fetching and printing (forecast is not saved in database) forecast regardless of the state of data in bucket!")
		elif (event["data"] == "saveTestDocument"):
			save_test_document = True
			print("Fetching and saving forecast to test document!")
		else:
			force_fetch_and_save = False
	else:
		force_fetch_and_save = False

	# Connect to Firestore database
	db = firestore.Client(project=project_id_and_bucket)
	document = db.collection("Harmonie forecast today & future").document("document")

	# Retrieve the old forecast data
	old_forecast = document.get().to_dict()
	now = datetime.now()

	# Check if the next forecast run will be available, based on the time it takes to run the model
	if (old_forecast):
		if ("timeRun" in old_forecast.keys()):
			datetime_next_run_available = parse(old_forecast["timeRun"]) + timedelta(hours=(2 + 6), minutes=55)
			if (now < datetime_next_run_available and force_fetch_and_save == False): 
				log_node_app_message("Won't check for forecast availability, update not online yet!", "info", True)
				return

	# Scrape the Euros webpage to get the latest forecast run time
	page = get("https://www.euroszeilen.utwente.nl/weer/grib/")
	tree = html.fromstring(page.content)
	datetime_most_recent_run = parse(tree.cssselect(".container:nth-child(2) .row:nth-child(4) div p")[0].text_content()[11:27])

	# Check if the retrieved latest model run time is newer than that one in the database
	if (old_forecast):
		if ("timeRun" in old_forecast.keys()):
			if (datetime_most_recent_run <= parse(old_forecast["timeRun"]) and force_fetch_and_save == False):
				log_node_app_message("New forecast run not available yet (retrieved from scraped page), retrying in 1 minute!", "info", True)
				if (datetime.now().minute == 10):
					log_node_app_message("This was the last time trying to fetch!", "info", True)
				return
	
	log_node_app_message("New run available, fetching and saving it...", "info", True)

	# Initialize object for the new forecast data
	updated_forecast = {}

	# Fetch the new forecast GRIB file
	response = get("https://www.euroszeilen.utwente.nl/weer/grib/download/harmonie_xy_wind.grb")
	stream = BytesIO(response.content)

	new_forecast = {}
	values = []
	lat_coordinates = []
	lon_coordinates = []

	# Extract data from GRIB file by looping over the GRIB messages
	for i, msg in enumerate(pupygrib.read(stream), 1):
		values.append(msg.get_values())

		#This is the same for all messages
		if (i == 1):
			datetime_model_run = msg.get_time()
			updated_forecast["timeRun"] = datetime_model_run.isoformat()
			for row in msg.get_coordinates()[1]:
				lat_coordinates.append(row[0])
				lon_coordinates = msg.get_coordinates()[0][0]

	NO_hours_to_parse = int(len(values) / 3) # Total amount of messages devided by the number of parameters
											# gives the number of hours in this model run
	# Process forecast for each location
	for location in locations:
		series = []

		#Checking if location is in the grid
		if (location["lat"] < max(lat_coordinates) and 
		location["lat"] > min(lat_coordinates) and 
		location["lon"] < max(lon_coordinates) and 
		location["lon"] > min(lon_coordinates)):

			# Getting the nearest grid point and indici of that grid point in the lat/lon matrices
			nearest_lat_coordinate = min(lat_coordinates, key=lambda x:abs(x-location["lat"]))
			neasest_lon_coordinate = min(lon_coordinates, key=lambda x:abs(x-location["lon"]))
			nearest_lat_coordinate_index = np.where(lat_coordinates == nearest_lat_coordinate)[0][0]
			neasest_lon_coordinate_index = np.where(lon_coordinates == neasest_lon_coordinate)[0][0]

			# For every hour...
			for message_index in range(NO_hours_to_parse):
				u_component_index = message_index * 3
				v_component_index = message_index * 3 + 1
				gust_index = message_index * 3 + 2

				u = values[u_component_index][nearest_lat_coordinate_index][neasest_lon_coordinate_index]
				v = values[v_component_index][nearest_lat_coordinate_index][neasest_lon_coordinate_index]

				speed = round(np.sqrt(u**2 + v**2) * 3.6 / 1.852, 3) # knots
				gust = round(values[gust_index][nearest_lat_coordinate_index][neasest_lon_coordinate_index] * 3.6 / 1.852, 3) # knots
				direction = round((np.degrees(np.arctan2(u, v)) + 180) % 360) # degrees from North, increasing clockwise

				datetime_UTC = datetime_model_run + timedelta(hours=message_index)
				datetime_local_TZ = datetime_UTC.astimezone(timezone)
				date = datetime_local_TZ.strftime("%d-%m-%Y")
				time = datetime_local_TZ.strftime("%H:%M")

				series.append({"time": time, "date": date , "s": speed, "g": gust, "d": direction})
		
				new_forecast[location["id"]] = series
			
	#Joining the two forecast files
	if (old_forecast):
		if "timeRun" in old_forecast.keys():
			if (old_forecast["timeRun"] == updated_forecast["timeRun"] and force_fetch_and_save == False):
				log_node_app_message("New forecast run not available yet (retrieved from parsed data), retrying in 1 minute!", "info", True)
				if (datetime.now().minute == 5):	log_node_app_message("This was the last time trying to fetch!", "error", True)
				return

	keys = list(new_forecast.keys())

	time_first_interval_new_forecast = new_forecast[keys[1]][0]["time"]
	date_first_interval_new_forecast = new_forecast[keys[1]][0]["date"]

	if (len(keys) <= 1):
		index_interval_insert_new_forecast = 0
	else:
		if (old_forecast is None):
			NO_intervals_to_delete = 0
			index_interval_insert_new_forecast = 0
		elif (keys[1] not in old_forecast.keys()):
			NO_intervals_to_delete = 0
			index_interval_insert_new_forecast = 0
		else:
			for index_interval_insert_new_forecast, times in enumerate(old_forecast[keys[1]]):
				if (times["time"] == time_first_interval_new_forecast 
				and times["date"] == date_first_interval_new_forecast):
					break
				else:
					index_interval_insert_new_forecast = 0

	if (old_forecast):
		if (keys[1] in old_forecast.keys()):
			NO_intervals_to_delete = len(old_forecast[keys[1]]) - index_interval_insert_new_forecast

	for i in range(len(keys)):
		if (keys[i] !=  "timeRun"):
			location_ID = keys[i]

			if (old_forecast):
				if (location_ID not in old_forecast.keys()):
					old_forecast[location_ID] = []

			#Deleting old forecasts (for which newer is available)
			if (old_forecast):
				if (len(old_forecast[location_ID]) >= NO_intervals_to_delete):
					for j in range(NO_intervals_to_delete):
						old_forecast[location_ID].pop()
				else:
					for j in range(len(old_forecast[location_ID])):
						old_forecast[location_ID].pop()

			if (old_forecast):
				updated_forecast[location_ID] = old_forecast[location_ID] + new_forecast[location_ID]
			else:
				updated_forecast[location_ID] = new_forecast[location_ID]

	if (print_only == True):
		print(updated_forecast)
	elif	(save_test_document == True):
		document = db.collection("Test document").document("document")
		document.set(updated_forecast)
		log_node_app_message("Saved new forecast to test document!", "info", True)
	else:		
		document.set(updated_forecast)
		log_node_app_message("Saved new forecast!", "info", True)