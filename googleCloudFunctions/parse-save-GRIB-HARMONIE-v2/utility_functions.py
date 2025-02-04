from requests import get, post, RequestException
import os
from datetime import datetime
import pytz





def log_node_app_message(message, Type, add_time_stamp, webserver_address):
	# Function to log messages to the logging feature of the webserver
    # Type is string equal to "debug", "error", "fetchError" or "info"
	print(message)

	body = {
		"message": f"[GCP] {message}",
		"type": Type,
		"addTimeStamp": add_time_stamp
	}
	response = post(f"{webserver_address}/logGCPMessage", json=body, headers={"Content-Type": "application/json", "Authorization": os.environ.get("GCP_LOGGER_KEY")})
	if (response.status_code != 200):
		print(response)







def set_variables_for_current_environment(mode):
    if mode == "production":
        webserver_address = "https://dewindnu.nl"
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
    except RequestException as e:
        print(f"Error fetching locations: {e}")
        return








def convert_unix_to_local_date_and_time(unix_timestamp, timezone):
    # HARMONIE times are in UTC, so interpret as such
    date_object = datetime.fromtimestamp(unix_timestamp, tz=pytz.utc)
    
    # Convert to local timezone
    date_object_local_timezone = date_object.astimezone(timezone)

    # Convert to date and time strings
    date = date_object_local_timezone.strftime("%d-%m-%Y")
    time = date_object_local_timezone.strftime("%H:%M")
    return date, time