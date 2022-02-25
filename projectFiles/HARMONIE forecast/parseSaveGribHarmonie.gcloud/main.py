from requests import get, post
import os
from google.cloud import storage
import json
from datetime import datetime
from datetime import timedelta
from dateutil.parser import parse
from lxml import html
import pupygrib
import numpy as np
from io import BytesIO
import pytz

def logNodeApp(message, Type, addTimeStamp):
  print(message)

  body = {
    "message": f"[GCP] {message}",
    "type": Type,
    "addTimeStamp": addTimeStamp
  }
  response = post("https://dewindnu.nl/logGCPMessage", json=body, headers={"Content-Type": "application/json", "Authorization": os.environ.get("GCP_LOGGER_KEY")})
  if (response.status_code != 200):
    print(response)

os.environ["TZ"] = "Europe/Amsterdam"
timezone = pytz.timezone("Europe/Amsterdam")

#Locations from 7 february 2022
locations = json.load(open("locations.json"))
projectIdAndBucket = os.environ.get("GCP_PROJECT_ID")

def runFunc (event, context):

  client = storage.Client(project=projectIdAndBucket)
  blob = client.get_bucket(projectIdAndBucket).blob("forecastData.json")
  oldForecast = json.loads(blob.download_as_string(client=None))

  now = datetime.now()

  if ("timeRun" in oldForecast.keys()):
    nextRunAvailable = parse(oldForecast["timeRun"]) + timedelta(hours=(2 + 6), minutes=55)
    if (now < nextRunAvailable): 
      logNodeApp("Won't check for forecast availability, update not online yet!", "info", True)
      return

  page = get("https://www.euroszeilen.utwente.nl/weer/grib/")
  tree = html.fromstring(page.content)

  timeMostRecentRun = parse(tree.cssselect(".container:nth-child(2) .row:nth-child(4) div p")[0].text_content()[11:27])

  if ("timeRun" in oldForecast.keys()):
    if (timeMostRecentRun <= parse(oldForecast["timeRun"])):
      logNodeApp("New forecast run not available yet (retrieved from scraped page), retrying in 1 minute!", "info", True)
      if (datetime.now().minute == 5):
        logNodeApp("This was the last time trying to fetch!", "info", True)
      return
  
  logNodeApp("New run available, fetching and saving it...", "info", True)

  saveForecast = {}

  response = get("https://www.euroszeilen.utwente.nl/weer/grib/download/harmonie_xy_wind.grb")
  stream = BytesIO(response.content)

  newForecast = {}
  values = []
  latPoints = []
  lonPoints = []

  # #Loop through messages to extract data
  for i, msg in enumerate(pupygrib.read(stream), 1):
    values.append(msg.get_values())

    #This is the same for all messages
    if (i == 1):
      timeRun = msg.get_time()
      timeRunUTC = timeRun.isoformat()
      saveForecast["timeRun"] = timeRunUTC
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
    
        newForecast[location["id"]] = series
      
  #Joining the two forecast files
  if "timeRun" in oldForecast.keys():
    if (oldForecast["timeRun"] == saveForecast["timeRun"]):
      logNodeApp("New forecast run not available yet (retrieved from parsed data), retrying in 1 minute!", "info", True)
      if (datetime.now().minute == 5):
        logNodeApp("This was the last time trying to fetch!", "error", True)
      return

  keys = list(newForecast.keys())

  timeFirstForecastData = newForecast[keys[1]][0]["time"]
  dateFirstForecastData = newForecast[keys[1]][0]["date"]

  if (len(keys) <= 1):
    indexTimeNewForecast = 0
  else:
    if (keys[1] not in oldForecast.keys()):
      NoTimesToDelete = 0
      indexTimeNewForecast = 0
    else:
      for indexTimeNewForecast, times in enumerate(oldForecast[keys[1]]):
        if times["time"] == timeFirstForecastData and times["date"] == dateFirstForecastData:
          break
        else:
          indexTimeNewForecast = 0

  if (keys[1] in oldForecast.keys()):
    NoTimesToDelete = len(oldForecast[keys[1]]) - indexTimeNewForecast

  for i in range(len(keys)):
    if (keys[i] !=  "timeRun"):
      locationID = keys[i]

      if (locationID not in oldForecast.keys()):
        oldForecast[locationID] = []

      #Deleting old forecasts (for which newer is available)
      for j in range(NoTimesToDelete):
        oldForecast[locationID].pop()

      saveForecast[locationID] = oldForecast[locationID] + newForecast[locationID]

  #Saving new forecast file
  client = storage.Client(project=projectIdAndBucket)
  bucket = client.get_bucket(projectIdAndBucket)
  blob = bucket.blob("forecastData.json")
  bucket.rename_blob(blob, "forecastData.old.json")

  blob = bucket.blob("forecastData.new.json")
  blob.upload_from_string(json.dumps(saveForecast))   

  blob = bucket.blob("forecastData.new.json")
  bucket.rename_blob(blob, "forecastData.json")

  logNodeApp("Saved new forecast!", "info", True)