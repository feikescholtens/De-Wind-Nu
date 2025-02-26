from google.cloud import firestore
import json

copy_data_from = "Harmonie forecast today & future v2"
copy_date_to = "test_input_and_output_forecasts/forecast_today_future_before_parsing.json"
# Connect to Firestore database
db = firestore.Client(project="de-wind-nu")
document = db.collection(copy_data_from).document("document")
data = document.get().to_dict()

# Open and write the JSON file
try:
    with open(copy_date_to, "w") as file:
        json.dump(data, file, indent=4)
except Exception as e:
    print(f"Failed to get save JSON data for updated_forecast data, failed with error: {e}")