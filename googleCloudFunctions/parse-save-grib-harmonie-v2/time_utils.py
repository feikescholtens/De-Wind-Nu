from datetime import datetime
import pytz

local_timezone = pytz.timezone("Europe/Amsterdam")







def convert_unix_to_local_date_and_time(unix_timestamp):
    # HARMONIE times are in UTC, so interpret as such
    date_object = datetime.fromtimestamp(unix_timestamp, tz=pytz.utc)
    
    # Convert to local timezone
    date_object_local_timezone = date_object.astimezone(local_timezone)

    # Convert to date and time strings
    date = date_object_local_timezone.strftime("%d-%m-%Y")
    time = date_object_local_timezone.strftime("%H:%M")
    return date, time












def convert_unix_to_local_date_obj(unix_timestamp):
    # HARMONIE times are in UTC, so interpret as such
    date_object = datetime.fromtimestamp(unix_timestamp, tz=pytz.utc)
    
    # Convert to local timezone
    date_object_local_timezone = date_object.astimezone(local_timezone)
    return date_object_local_timezone












def get_date_today_local_time ():
    date_obj_today_obj = datetime.now(local_timezone)
    date_obj_today_obj_begin_of_day = date_obj_today_obj.replace(hour=0, minute=0, second=0, microsecond=0)
    return date_obj_today_obj_begin_of_day