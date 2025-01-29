import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import joblib
import nltk
import re

# Download required NLTK data
nltk.download('stopwords')
nltk.download('punkt')

def load_csv_data(file_path):
    """Load and validate CSV data."""
    try:
        # Read CSV with all columns as strings to avoid type inference issues
        df = pd.read_csv(file_path, dtype=str)
        
        # Check required columns
        required_columns = ['Clause Text', 'Risk Level']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
            
        return df
        
    except FileNotFoundError:
        raise FileNotFoundError(f"CSV file not found at: {file_path}")
    except Exception as e:
        raise Exception(f"Error reading CSV file: {str(e)}")

def preprocess_text(text):
    """Clean and preprocess the text data."""
    # Convert to lowercase
    text = str(text).lower()
    # Remove special characters and numbers
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text

def generate_embeddings(df, model):
    """Generate embeddings for the clause texts."""
    clauses = df['Clause Text'].apply(preprocess_text).tolist()
    embeddings = model.encode(clauses, convert_to_tensor=True)
    return embeddings

def train_risk_classifier(df, embeddings):
    """Train a classifier to predict risk levels based on embeddings."""
    y = df['Risk Level']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(embeddings, y, test_size=0.2, random_state=42)
    
    # Train classifier (Logistic Regression)
    classifier = LogisticRegression(max_iter=1000)
    classifier.fit(X_train, y_train)
    
    # Predict on test set
    y_pred = classifier.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    return classifier, accuracy

def analyze_new_clause(clause_text, classifier, model):
    """Analyze a new clause and predict its risk level."""
    # Preprocess the new text
    processed_text = preprocess_text(clause_text)
    
    # Generate embedding for the new clause
    new_embedding = model.encode([processed_text], convert_to_tensor=True)
    
    # Predict risk level
    risk_level = classifier.predict(new_embedding)[0]
    
    return risk_level

def save_model_and_vectorizer(classifier, filename='risk_classifier.pkl'):
    """Save classifier to a .pkl file."""
    with open(filename, 'wb') as f:
        joblib.dump(classifier, f)
    print(f"Model saved to {filename}")

def main(csv_path):
    """Main function to run the analysis."""
    try:
        # Load data
        print("Loading data...")
        df = load_csv_data(csv_path)
        
        # Load the pre-trained model
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Generate embeddings for clause texts
        print("\nGenerating embeddings...")
        embeddings = generate_embeddings(df, model)
        
        # Train classifier
        print("\nTraining classifier...")
        classifier, accuracy = train_risk_classifier(df, embeddings)
        
        # Save model
        save_model_and_vectorizer(classifier)
        
        # Print results
        print(f"\nAccuracy of the classifier: {accuracy:.2f}")
        
        return classifier, model
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return None, None

# Usage example
csv_path = "/content/risk_data.csv"  # Replace with your CSV file path
classifier, model = main(csv_path)

if classifier and model:
    # Example of analyzing a new clause
    new_clause = "The employee shall be entitled to any ."
    risk_level = analyze_new_clause(new_clause, classifier, model)
    print(f"\nAnalysis for new clause:")
    print(f"Predicted Risk Level: {risk_level}")
