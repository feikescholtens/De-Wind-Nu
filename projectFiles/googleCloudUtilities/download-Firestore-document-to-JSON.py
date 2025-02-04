import json
from google.cloud import firestore
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/home/feiking/.config/gcloud/de-wind-nu-1b13a2c9230d.json"

# Function to download a Firestore document to a JSON file
def download_firestore_document(collection_name, document_id, output_file):
    # Initialize Firestore client
    db = firestore.Client()
    
    # Reference to the document
    doc_ref = db.collection(collection_name).document(document_id)
    
    # Fetch document
    doc = doc_ref.get()
    
    if doc.exists:
        # Convert document data to JSON
        data = doc.to_dict()
        
        # Save to file
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
        
        print(f"Document saved as {output_file}")
    else:
        print("Document does not exist")

# Example usage
download_firestore_document("Test document", "document", "oldScript.json")
