#For testing, from 7 febrary 2022
locations = [
  { "id": "3958", "lat": 51.5649, "lon": 4.9351 },
  { "id": "9690", "lat": 51.3153, "lon": 3.1094 },
  { "id": "1141", "lat": 52.9242, "lon": 4.7793 },
  { "id": "3235", "lat": 51.3542, "lon": 3.1722 },
  { "id": "0290", "lat": 52.2731, "lon": 6.8909 },
  { "id": "8254", "lat": 51.3331, "lon": 3.2192 },
  { "id": "8245", "lat": 51.4477, "lon": 4.342 },
  { "id": "1612", "lat": 52.7491, "lon": 6.573 },
  { "id": "5407", "lat": 50.9053, "lon": 5.7618 },
  { "id": "3107", "lat": 53.1944, "lon": 7.1493 },
  { "id": "1218", "lat": 52.0988, "lon": 5.1797 },
  { "id": "9556", "lat": 51.1967, "lon": 5.7625 },
  { "id": "0304", "lat": 52.7019, "lon": 5.8874 },
  { "id": "0205", "lat": 51.2375, "lon": 2.9242 },
  { "id": "1892", "lat": 52.0675, "lon": 6.6567 },
  { "id": "7713", "lat": 52.6427, "lon": 4.9787 },
  { "id": "7619", "lat": 51.3944, "lon": 3.0458 },
  { "id": "3714", "lat": 51.4413, "lon": 3.5959 },
  { "id": "3406", "lat": 52.8966, "lon": 5.3833 },
  { "id": "1251", "lat": 51.526, "lon": 3.8836 },
  { "id": "0227", "lat": 52.3154, "lon": 4.7902 },
  { "id": "4997", "lat": 51.5, "lon": 6.2 },
  { "id": "3356", "lat": 52.4573, "lon": 5.5196 },
  { "id": "0323", "lat": 51.969, "lon": 4.9259 },
  { "id": "3019", "lat": 51.3886, "lon": 2.4378 },
  { "id": "8231", "lat": 51.9607, "lon": 4.4469 },
  { "id": "3216", "lat": 51.2377, "lon": 2.9301 },
  { "id": "7135", "lat": 51.1558, "lon": 2.7167 },
  { "id": "9462", "lat": 51.2248, "lon": 3.861 },
  { "id": "9990", "lat": 51.8576, "lon": 5.1454 },
  { "id": "5331", "lat": 53.1237, "lon": 6.5848 },
  { "id": "4711", "lat": 51.4498, "lon": 5.377 },
  { "id": "7941", "lat": 51.4183, "lon": 3.2986 },
  { "id": "1071", "lat": 53.223, "lon": 5.7516 },
  { "id": "2721", "lat": 51.6585, "lon": 5.7066 },
  { "id": "8527", "lat": 52.0549, "lon": 5.8723 },
  { "id": "4352", "lat": 53.4116, "lon": 6.199 },
  { "id": "3617", "lat": 53.6167, "lon": 4.9667 },
  { "id": "8700", "lat": 51.6559, "lon": 3.694 },
  { "id": "5392", "lat": 53.4916, "lon": 5.9411 },
  { "id": "9057", "lat": 54.85, "lon": 4.7167 },
  { "id": "2924", "lat": 53.5158, "lon": 5.9583 },
  { "id": "1660", "lat": 51.954, "lon": 4.16 },
  { "id": "3290", "lat": 51.3278, "lon": 3.8162 },
  { "id": "0727", "lat": 53.8166, "lon": 2.95 },
  { "id": "3318", "lat": 57.6617, "lon": 1.145 },
  { "id": "6327", "lat": 51.5954, "lon": 4.006 },
  { "id": "4806", "lat": 55.4167, "lon": 3.8167 },
  { "id": "5098", "lat": 51.7665, "lon": 3.6217 },
  { "id": "6353", "lat": 51.5102, "lon": 4.1739 },
  { "id": "5503", "lat": 51.4458, "lon": 3.9975 },
  { "id": "5260", "lat": 51.8886, "lon": 4.3138 },
  { "id": "6901", "lat": 52.5321, "lon": 5.2312 },
  { "id": "8609", "lat": 54.3167, "lon": 2.9333 },
  { "id": "6823", "lat": 61.0961, "lon": 1.7214 },
  { "id": "2829", "lat": 51.8362, "lon": 4.0544 },
  { "id": "2418", "lat": 53.4659, "lon": 6.7574 },
  { "id": "5838", "lat": 52.6324, "lon": 5.1735 },
  { "id": "9810", "lat": 53.4744, "lon": 6.8217 },
  { "id": "3153", "lat": 51.9978, "lon": 3.2751 },
  { "id": "1641", "lat": 53.5738, "lon": 6.3984 },
  { "id": "5367", "lat": 51.544, "lon": 3.8653 },
  { "id": "4037", "lat": 51.3799, "lon": 3.3791 },
  { "id": "3139", "lat": 51.9776, "lon": 4.1199 },
  { "id": "8408", "lat": 53.4279, "lon": 5.3332 },
  { "id": "0577", "lat": 51.9814, "lon": 4.0814 },
  { "id": "2531", "lat": 52.7483, "lon": 5.559 },
  { "id": "9099", "lat": 52.6003, "lon": 5.3912 },
  { "id": "7117", "lat": 52.9253, "lon": 4.1504 },
  { "id": "9866", "lat": 52.9254, "lon": 4.1503 },
  { "id": "5852", "lat": 51.6999, "lon": 3.0567 },
  { "id": "6943", "lat": 53.2667, "lon": 3.6333 },
  { "id": "6862", "lat": 51.6666, "lon": 4.0957 },
  { "id": "4662", "lat": 51.6286, "lon": 3.9178 },
  { "id": "8105", "lat": 52.6481, "lon": 5.4006 },
  { "id": "0868", "lat": 51.9257, "lon": 3.6699 },
  { "id": "0906", "lat": 53.43, "lon": 5.7589 },
  { "id": "0890", "lat": 52.4637, "lon": 4.5174 },
  { "id": "1843", "lat": 57.185, "lon": 1 },
  { "id": "3554", "lat": 53.217, "lon": 3.2189 },
  { "id": "3695", "lat": 52.4623, "lon": 4.5548 },
  { "id": "7147", "lat": 51.443, "lon": 3.5974 },
  { "id": "4426", "lat": 51.5037, "lon": 3.2421 },
  { "id": "7550", "lat": 52.3587, "lon": 3.3415 },
  { "id": "3696", "lat": 52.995, "lon": 4.7199 },
  { "id": "3885", "lat": 51.8918, "lon": 4.3125 },
  { "id": "0904", "lat": 52.4637, "lon": 4.5323 },
  { "id": "9460", "lat": 53.24, "lon": 4.9208 },
  { "id": "5673", "lat": 51.991, "lon": 4.1218 },
  { "id": "0757", "lat": 52.1396, "lon": 4.4364 },
  { "id": "4393", "lat": 53.3912, "lon": 5.3457 },
  { "id": "9784", "lat": 52.4339, "lon": 6.2617 }
]

import pupygrib
import numpy as np
from requests import get
from io import BytesIO
from datetime import timedelta
from flask import jsonify
import pytz
import os

os.environ["TZ"] = "Europe/Amsterdam"
timezone = pytz.timezone("Europe/Amsterdam")

#From here in function, uncomment below in Google Cloud

#requestJson = request.get_json()
#locations = requestJson["locations"]

returnObject = {}

response = get("https://www.euroszeilen.utwente.nl/weer/grib/download/harmonie_xy_wind.grb")
stream = BytesIO(response.content)

values = []
latPoints = []
lonPoints = []

#Loop through messages to extract data
for i, msg in enumerate(pupygrib.read(stream), 1):
    values.append(msg.get_values())

    #This is the same for all messages
    if (i == 1):
        timeRun = msg.get_time()
        timeRunUTC = timeRun.isoformat()
        returnObject["timeRun"] = timeRunUTC
        for row in msg.get_coordinates()[1]:
            latPoints.append(row[0])
            lonPoints = msg.get_coordinates()[0][0]

parseNoHours = len(values) / 3
if (timeRun.strftime("%H") == "00"):
    parseNoHours = 24
if (timeRun.strftime("%H") == "06"):
    parseNoHours = 18
if (timeRun.strftime("%H") == "12"):
    parseNoHours = 12
if (timeRun.strftime("%H") == "18"):
    parseNoHours = 30

#Loop for every location
for location in locations:

    series = []

    #Checking if location is in the grid
    if (location["lat"] < max(latPoints) and 
    location["lat"] > min(latPoints) and 
    location["lon"] < max(lonPoints) and 
    location["lon"] > min(lonPoints)):

        #Getting the nearest grid point and indici
        nearestPointLat = min(latPoints, key=lambda x:abs(x-location["lat"]))
        nearestPointLon = min(lonPoints, key=lambda x:abs(x-location["lon"]))

        nearestPointLat_Index = np.where(latPoints == nearestPointLat)[0][0]
        nearestPointLon_Index = np.where(lonPoints == nearestPointLon)[0][0]

        #Loop though every hour
        for messageIndex in range(int(parseNoHours)):
            uIndex = messageIndex * 3
            vIndex = messageIndex * 3 + 1
            gustIndex = messageIndex * 3 + 2

            u = values[uIndex][nearestPointLat_Index][nearestPointLon_Index]
            v = values[vIndex][nearestPointLat_Index][nearestPointLon_Index]

            #In knots and degrees
            speed = round(np.sqrt(u**2 + v**2) * 3.6 / 1.852, 3)
            gust = round(values[gustIndex][nearestPointLat_Index][nearestPointLon_Index] * 3.6 / 1.852, 3)
            direction = round((np.degrees(np.arctan2(u, v)) + 180) % 360)

            timeStamp = timeRun + timedelta(hours=messageIndex)
            timeStampLocal = timeStamp.astimezone(timezone)

            time = timeStampLocal.strftime("%H:%M")
            date = timeStampLocal.strftime("%d-%m-%Y")

            series.append({"time": time, "date": date , "s": speed, "g": gust, "d": direction})
        
            returnObject[location["id"]] = series

print(returnObject)