import io
from requests import get
import sys
from google.cloud import secretmanager
from datetime import datetime








def get_secret(secret_name):
	try:
		client = secretmanager.SecretManagerServiceClient()
		secret_path = client.secret_path("de-wind-nu", secret_name) + "/versions/latest"
		response = client.access_secret_version(name=secret_path)
		payload = response.payload.data.decode("UTF-8")
		return payload
	except Exception as e:
		print(f"Failed getting the secret from Google Secret Manager: {e}")
		return None
KNMI_open_data_API_key = get_secret("KDP_OPENDATA_KEY")
















def fetch_latest_NetCDF_filenames_KNMI():
	# Base URL for the KNMI API
	base_url = "https://api.dataplatform.knmi.nl/open-data/v1/datasets/uwcw_extra_lv_ha43_nl_2km/versions/1.0/files"

	# Query parameters for the request
	max_keys = 19 # The latest 19 files are fetched, each model run has 19 files associated with it
	sorting = "desc" # Sort the files in descending order
	order_by = "created" # Order the files by the creation date

	# Construct the URL with query parameters
	url = f"{base_url}?maxKeys={max_keys}&sorting={sorting}&orderBy={order_by}"

	try:
		response = get(url, headers={"Authorization": KNMI_open_data_API_key})
		response.raise_for_status()
		data = response.json()
	except Exception as e:
		print(f"Fetching latest NetCDF filenames from KNMI failed with error (function {sys._getframe().f_code.co_name}): {e}")
		return None, None, None

	# Keywords to filter filenames
	keywords = ["uwcw_ha43_nl_2km_wind-speed-components-hagl", "uwcw_ha43_nl_2km_wind-speed-of-gust-01h-hagl"]

	# Extract filenames that match the keywords
	matching_files = [
		file["filename"] for file in data.get("files", [])
		if any(keyword in file["filename"] for keyword in keywords)
	]
	if (len(matching_files) == 0):
		print(f"Extracting filenames from response of list of NetCDF files failed (function {sys._getframe().f_code.co_name}). The files probably don't exist.")
		return None, None
	# It doens't need to be checked if the model run times are the same! 

	model_run_datetime = datetime.strptime(matching_files[0].split("_")[-1].replace(".nc", " +0000"), "%Y%m%dT%H %z")

	# Sort to ensure 'components-hagl' appears first
	return_parameters = sorted(matching_files, key=lambda x: keywords.index(next(k for k in keywords if k in x)))
	return_parameters.append(model_run_datetime)

	return return_parameters














def fetch_download_links_KNMI(file_name_wind_direction, file_name_gust):
	# Base URL for the KNMI API
	base_url = "https://api.dataplatform.knmi.nl/open-data/v1/datasets/uwcw_extra_lv_ha43_nl_2km/versions/1.0/files"

	# Construct the URLs
	url_wind_direction = f"{base_url}/{file_name_wind_direction}/url"
	url_gust = f"{base_url}/{file_name_gust}/url"

	# Fetch the download links
	try:
		response = get(url_wind_direction, headers={"Authorization": KNMI_open_data_API_key})
		response.raise_for_status()
		download_link_wind_direction = response.json().get("temporaryDownloadUrl")
	except Exception as e:
		print(f"Fetching download link for wind direction NetCDF file from KNMI failed with error (function {sys._getframe().f_code.co_name}): {e}")
		return None, None
	
	try:
		response = get(url_gust, headers={"Authorization": KNMI_open_data_API_key})
		response.raise_for_status()
		download_link_gust = response.json().get("temporaryDownloadUrl")
	except Exception as e:
		print(f"Fetching download link for gust NetCDF file from KNMI failed with error (function {sys._getframe().f_code.co_name}): {e}")
		return None, None


	# Extract the download links from the response
	return download_link_wind_direction, download_link_gust














def fetch_NetCDF_files_KNMI (file_name_wind_direction, file_name_gust):
	# Fetch (temporarily) download links for the NetCDF files from the KNMI
	download_link_wind_direction, download_link_gust = fetch_download_links_KNMI(file_name_wind_direction, file_name_gust)
	if download_link_wind_direction == None or download_link_gust == None:		return None, None

	# Fetch the files as BytesIO objects
	try:
		response = get(download_link_wind_direction)
		response.raise_for_status()
		bytes_wind_direction = io.BytesIO(response.content)
	except Exception as e:
		print(f"Fetching wind direction NetCDF file from KNMI failed with error (function {sys._getframe().f_code.co_name}): {e}")
		return None, None
	
	try:
		response = get(download_link_gust)
		response.raise_for_status()
		bytes_gust = io.BytesIO(response.content)
	except Exception as e:
		print(f"Fetching gust NetCDF file from KNMI failed with error (function {sys._getframe().f_code.co_name}): {e}")
		return None, None

	return bytes_wind_direction, bytes_gust