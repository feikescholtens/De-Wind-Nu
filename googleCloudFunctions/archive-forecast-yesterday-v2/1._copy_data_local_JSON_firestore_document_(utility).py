from google.cloud import firestore
import json

copy_data_from = "test_input_and_output_forecasts/forecast_today_future_before_parsing.json"
copy_date_to = "Harmonie forecast today & future v2"

# Open and read the JSON file
try:
    with open(copy_data_from, "r") as file:
        data = json.load(file)
except Exception as e:
    print(f"Failed to get local JSON data for old_forecast data, failed with error: {e}")

# Connect to Firestore database
db = firestore.Client(project="de-wind-nu")
document = db.collection(copy_date_to).document("document")
#Save data to Firestore document
document.set(data)

