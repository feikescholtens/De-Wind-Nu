import json
from google.cloud import firestore















def get_forecast (use_local_JSON_for_getting_and_storing_forecasts, firestore_document_to_use):

	if use_local_JSON_for_getting_and_storing_forecasts == True:
		# Open and read the JSON file
		try:
			with open("test_input_and_output_forecasts/forecast_today_future_before_parsing.json", "r") as file:
				data = json.load(file)
				return data
		except Exception as e:
			print(f"Failed to get local JSON data for old_forecast data, failed with error: {e}")
		
	if use_local_JSON_for_getting_and_storing_forecasts == False:
		# Get data from Firestore document
		# Connect to Firestore database
		db = firestore.Client(project="de-wind-nu")
		document = db.collection(firestore_document_to_use).document("document")
		
		data = document.get().to_dict()
		if (data == None): 	print("Failed to get data for old_forecast from Google Firestore, the data retrieved is equal to None. Check the database by hand?")
		return data
	




















def save_archive_forecast(per_day_forecast_to_archive, use_local_JSON_for_getting_and_storing_forecasts, firestore_document_archive):

	# Save the archive forecast data to a JSON file
	if use_local_JSON_for_getting_and_storing_forecasts == True:
		# Open and write the JSON file
		try:
			with open("test_input_and_output_forecasts/forecast_archive_after_parsing.json", "w") as file:
				json.dump(per_day_forecast_to_archive, file, indent=4)
		except Exception as e:
			print(f"Failed to get save JSON data for updated_forecast data, failed with error: {e}")

	# Save the archive forecast data to Firestore
	if use_local_JSON_for_getting_and_storing_forecasts == False:
		# Connect to Firestore database
		db = firestore.Client(project="de-wind-nu")

		for date, forecast in per_day_forecast_to_archive.items():
			document = db.collection(firestore_document_archive).document(date)

			if document.get().exists == True: print(f"Firestore document for date {date} already exists, will not overwrite it.")
			
			#Save data to Firestore document
			document.set(forecast)



















def save_NEW_forecast_today_future(NEW_forecast_today_future, use_local_JSON_for_getting_and_storing_forecasts, firestore_document_today_future):
	
	# Save the forecast data for today and the future to a JSON file
	if use_local_JSON_for_getting_and_storing_forecasts == True:
		# Open and write the JSON file
		try:
			with open("test_input_and_output_forecasts/forecast_today_future_after_parsing.json", "w") as file:
				json.dump(NEW_forecast_today_future, file, indent=4)
		except Exception as e:
			print(f"Failed to get save JSON data for updated_forecast data, failed with error: {e}")

	# Save the forecast data for today and the future to Firestore
	if use_local_JSON_for_getting_and_storing_forecasts == False:
		# Connect to Firestore database
		db = firestore.Client(project="de-wind-nu")
		document = db.collection(firestore_document_today_future).document("document")

		# Save data to Firestore document
		document.set(NEW_forecast_today_future)