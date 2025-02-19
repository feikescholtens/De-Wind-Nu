import json
from datetime import datetime
import numpy as np


delta_minutes_array_wind_speed = np.array([])
delta_minutes_array_gust = np.array([])


with open("file_list_KNMI_API.json", 'r') as file:
    data = json.load(file)


for file in data["files"]:
    filename = file["filename"]
    created = file["created"]

    created_datetime = datetime.strptime(created, "%Y-%m-%dT%H:%M:%S%z")
    run_datetime = datetime.strptime(filename.split("_")[-1].replace(".nc", " +0000"), "%Y%m%dT%H %z")
    
    delta = created_datetime - run_datetime
    delta_minutes = delta.total_seconds() / 60

    if "wind-speed-components" in filename:
        delta_minutes_array_wind_speed = np.append(delta_minutes_array_wind_speed, delta_minutes)
    if "wind-speed-of-gust" in filename:
        delta_minutes_array_gust = np.append(delta_minutes_array_gust, delta_minutes)

print(f"Average, min, max and std publication time wind and direction dataset: {delta_minutes_array_wind_speed.mean()}, {delta_minutes_array_wind_speed.min()}, {delta_minutes_array_wind_speed.max()} and {delta_minutes_array_wind_speed.std()}  minutes")
print(f"Average, min, max and std publication time wind and direction dataset: {delta_minutes_array_gust.mean()}, {delta_minutes_array_gust.min()}, {delta_minutes_array_gust.max()} and {delta_minutes_array_gust.std()} minutes")