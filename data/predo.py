import os
import re
from flask import Flask, request, jsonify
import joblib
from sentence_transformers import SentenceTransformer
import numpy as np

app = Flask(__name__)

# Load the pre-trained classifier and the SentenceTransformer model
classifier_path = './risk_classifier.pkl'  # Path to your saved classifier model
if os.path.exists(classifier_path):
    classifier = joblib.load(classifier_path)
else:
    raise FileNotFoundError(f"Classifier model file not found at {classifier_path}")

# Load the Sentence Transformer model for embedding generation
model = SentenceTransformer('all-MiniLM-L6-v2')

def preprocess_text(text):
    """Clean and preprocess the text data."""
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)  # Remove special characters
    text = ' '.join(text.split())  # Remove extra whitespace
    return text

def analyze_new_clause(clause_text):
    """Analyze a new clause and predict its risk level."""
    # Preprocess the new text
    processed_text = preprocess_text(clause_text)
    
    # Generate embedding for the new clause
    new_embedding = model.encode([processed_text], convert_to_tensor=True)
    
    # Predict risk level
    risk_level = classifier.predict(new_embedding)[0]
    
    return risk_level

@app.route('/predict', methods=['POST'])
def predict_risk_level():
    """API endpoint to predict the risk level of a clause."""
    try:
        # Get the input data (JSON format)
        data = request.get_json()
        clause_text = data.get('clause_text')
        
        if not clause_text:
            return jsonify({"error": "No clause_text provided"}), 400
        
        # Predict risk level
        risk_level = analyze_new_clause(clause_text)
        
        # Return the prediction as a JSON response
        return jsonify({"risk_level": risk_level}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
