from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from transformers import pipeline
import torch
from typing import List, Dict
from dataclasses import dataclass
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv
import os
import re
import joblib
from sentence_transformers import SentenceTransformer
import numpy as np

# Load environment variables
load_dotenv()
os.environ['KMP_DUPLICATE_LIB_OK']='TRUE'
os.environ['GOOGLE_API_KEY'] = os.getenv("GOOGLE_API_KEY")

if torch.cuda.is_available():
    torch.set_num_threads(1)
    torch.set_num_interop_threads(1)

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:5000"],  # Add your frontend URLs
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Range", "X-Content-Range"],
        "supports_credentials": True,  # Enable if you need to send cookies
        "max_age": 120  # Cache preflight requests for 2 minutes
    }
})

# Initialize models
summarizer = pipeline(
    "summarization",
    model="facebook/bart-large-cnn",
    device=0 if torch.cuda.is_available() else -1
)

# Load risk assessment models
classifier_path = './risk_classifier.pkl'
if os.path.exists(classifier_path):
    classifier = joblib.load(classifier_path)
else:
    raise FileNotFoundError(f"Classifier model file not found at {classifier_path}")

sentence_transformer = SentenceTransformer('all-MiniLM-L6-v2')

@dataclass
class CaseReference:
    case_source: str
    category: str
    relevant_text: str
    pdf_path: str

class LegalCaseAdvisor:
    def __init__(self, vector_store_path: str):
        self.vector_store = FAISS.load_local(
            vector_store_path,
            GoogleGenerativeAIEmbeddings(model="models/embedding-001"),
            allow_dangerous_deserialization=True
        )
        
        self.llm = GoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0.3,
            top_p=0.8,
            top_k=40,
            max_output_tokens=2048
        )
        
        self.analysis_prompt = PromptTemplate(
            input_variables=["situation", "relevant_cases"],
            template="""
            
            Analyze the following situation and provide actionable steps based on similar cases:

            SITUATION:
            {situation}

            RELEVANT CASES AND PRECEDENTS:
            {relevant_cases}

            Please provide:
            1. A brief analysis of the situation
            2. Specific steps recommended based on similar cases (with case references)
            3. Key considerations and potential challenges
            
            Act like an contract/application notice drafter that replies to the given Notice based on Indian Laws in reply to this based on whichever domain applicable - Labor Laws
            -Copyright
            -Real Estate Regulation & Development Act
            -GDPR
            -Foreign Trade & Customs Act
            and give links to indiankanoon website at the end
            Format the response in a clear, structured way with case citations inline
            """
        )
        
        self.chain = LLMChain(llm=self.llm, prompt=self.analysis_prompt)

    def get_relevant_cases(self, query: str, num_cases: int = 5) -> List[CaseReference]:
        results = self.vector_store.similarity_search(query, k=num_cases)
        cases = []
        for doc in results:
            case = CaseReference(
                case_source=doc.metadata['source'],
                category=doc.metadata['category'],
                relevant_text=doc.page_content,
                pdf_path=doc.metadata.get('pdf_path', '')
            )
            cases.append(case)
        return cases

    def format_cases_for_prompt(self, cases: List[CaseReference]) -> str:
        formatted_cases = []
        for i, case in enumerate(cases, 1):
            formatted_case = f"""
            Case {i} [Ref: {case.case_source}] ({case.category}):
            {case.relevant_text}
            """
            formatted_cases.append(formatted_case)
        return "\n".join(formatted_cases)

    def get_advice(self, situation_summary: str) -> Dict:
        try:
            relevant_cases = self.get_relevant_cases(situation_summary)
            formatted_cases = self.format_cases_for_prompt(relevant_cases)
            
            response = self.chain.run({
                "situation": situation_summary,
                "relevant_cases": formatted_cases
            })
            
            disclaimer = """
            IMPORTANT DISCLAIMER:
            This analysis is provided for informational purposes only and should not be considered as legal advice. 
            The recommendations are based on similar historical cases but may not fully apply to your specific situation. 
            Please consult with qualified legal professionals before taking any action. 
            The accuracy of case references and citations should be independently verified.
            """
            
            return {
                "success": True,
                "analysis": response,
                "cases_referenced": [
                    {
                        "source": case.case_source,
                        "category": case.category,
                        "pdf_path": case.pdf_path
                    } for case in relevant_cases
                ],
                "disclaimer": disclaimer
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "disclaimer": "An error occurred while generating advice. Please try again."
            }

# Initialize legal advisor
legal_advisor = LegalCaseAdvisor("faiss_index")

def preprocess_text(text):
    """Clean and preprocess the text data."""
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = ' '.join(text.split())
    return text

def analyze_clause_risk(clause_text):
    """Analyze a single clause and predict its risk level."""
    processed_text = preprocess_text(clause_text)
    embedding = sentence_transformer.encode([processed_text], convert_to_tensor=True)
    risk_level = classifier.predict(embedding)[0]
    return risk_level

def split_into_clauses(text):
    """Split text into clauses using common legal document markers."""
    # Split on common clause markers (numbers, letters, or specific keywords)
    clause_markers = r'(?:\d+\.|\([a-z]\)|\bARTICLE\b|\bSECTION\b|\bCLAUSE\b)'
    clauses = re.split(f"(?={clause_markers})", text)
    return [clause.strip() for clause in clauses if clause.strip()]

def chunk_text(text, max_chunk_size=1024):
    """Split text into chunks that the model can process"""
    words = text.split()
    chunks = []
    current_chunk = []
    current_size = 0
    
    for word in words:
        if current_size + len(word) + 1 <= max_chunk_size:
            current_chunk.append(word)
            current_size += len(word) + 1
        else:
            chunks.append(' '.join(current_chunk))
            current_chunk = [word]
            current_size = len(word) + 1
            
    if current_chunk:
        chunks.append(' '.join(current_chunk))
        
    return chunks

def summarize_legal_document(text):
    """Summarize legal document text using BART model"""
    try:
        chunks = chunk_text(text)
        summaries = []
        for chunk in chunks:
            if len(chunk.split()) < 10:
                continue
            summary = summarizer(chunk, 
                               max_length=150,
                               min_length=30,
                               do_sample=False)
            summaries.append(summary[0]['summary_text'])
        
        final_summary = ' '.join(summaries)
        
        if not final_summary and text:
            summary = summarizer(text,
                               max_length=150,
                               min_length=30,
                               do_sample=False)
            final_summary = summary[0]['summary_text']
            
        return final_summary

    except Exception as e:
        print(f"Error in summarization: {str(e)}")
        return None

@app.route('/api/pdf/<path:pdf_path>')
def serve_pdf(pdf_path):
    """Serve PDF files"""
    try:
        return send_file(pdf_path, mimetype='application/pdf')
    except Exception as e:
        return jsonify({'error': f'PDF not found: {str(e)}'}), 404

@app.route('/api/analyze', methods=['POST'])
def analyze_document():
    try:
        data = request.json
        ocr_text = data.get('text')
        
        if not ocr_text:
            return jsonify({
                'error': 'No text provided'
            }), 400

        # Clean the text
        cleaned_text = ' '.join(ocr_text.split())

        # Generate summary
        summary = summarize_legal_document(cleaned_text)
        
        if summary is None:
            return jsonify({
                'error': 'Failed to generate summary'
            }), 500

        # Get legal advice based on summary
        advice = legal_advisor.get_advice(summary)
        
        # Split text into clauses and analyze risk for each
        clauses = split_into_clauses(cleaned_text)
        clause_analysis = []
        
        for i, clause in enumerate(clauses, 1):
            risk_level = analyze_clause_risk(clause)
            clause_analysis.append({
                'clause_number': i,
                'text': clause,
                'risk_level': risk_level
            })

        # Calculate overall document risk level (e.g., highest risk among clauses)
        overall_risk = max(analysis['risk_level'] for analysis in clause_analysis)
        
        # Return combined results
        return jsonify({
            'summary': summary,
            'original_text': cleaned_text,
            'legal_analysis': advice,
            'risk_analysis': {
                'overall_risk': overall_risk,
                'clause_analysis': clause_analysis
            }
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)