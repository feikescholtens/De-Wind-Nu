from google.cloud import firestore

copy_data_from = "Harmonie forecast today & future"
copy_data_to = "Harmonie forecast today & future v2"

# Connect to Firestore database
db = firestore.Client(project="de-wind-nu")
document = db.collection(copy_data_from).document("document")
data = document.get().to_dict()

# Connect to Firestore database
db = firestore.Client(project="de-wind-nu")
document = db.collection(copy_data_to).document("document")
document.set(data)