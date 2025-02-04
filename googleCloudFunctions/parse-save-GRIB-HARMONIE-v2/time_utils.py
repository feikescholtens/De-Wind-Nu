from datetime import datetime
import pytz

local_timezone = pytz.timezone("Europe/Amsterdam")







def convert_unix_to_local_date_and_time(unix_timestamp, timezone):
    # HARMONIE times are in UTC, so interpret as such
    date_object = datetime.fromtimestamp(unix_timestamp, tz=pytz.utc)
    
    # Convert to local timezone
    date_object_local_timezone = date_object.astimezone(timezone)

    # Convert to date and time strings
    date = date_object_local_timezone.strftime("%d-%m-%Y")
    time = date_object_local_timezone.strftime("%H:%M")
    return date, time
