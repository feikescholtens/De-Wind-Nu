import pupygrib
import numpy as np
from requests import get
from io import BytesIO
from datetime import timedelta
from flask import jsonify

def runFunc(request):
    requestJson = request.get_json()
    locations = requestJson["locations"]

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
            for row in msg.get_coordinates()[1]:
                latPoints.append(row[0])
                lonPoints = msg.get_coordinates()[0][0]

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

            #Loop though every hour (3 messages for every hour)
            for messageIndex in range(int(len(values) / 3)):
                uIndex = messageIndex * 3
                vIndex = messageIndex * 3 + 1

                u = values[uIndex][nearestPointLat_Index][nearestPointLon_Index]
                v = values[vIndex][nearestPointLat_Index][nearestPointLon_Index]

                #In knots and degrees
                speed = round(np.sqrt(u**2 + v**2) * 3.6 / 1.852, 1)
                direction = round((np.degrees(np.arctan2(u, v)) + 180) % 360)

                timeStamp = (timeRun + timedelta(hours=messageIndex)).isoformat()

                series.append({"time": timeStamp, "s": speed, "d": direction})
            
                returnObject[location["id"]] = series

    return jsonify(returnObject)
