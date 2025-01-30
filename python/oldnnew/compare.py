from flask import Flask, request, jsonify
import os
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Initialize the LawComparison instance
    try:
        app.comparator = LawComparison()
    except Exception as e:
        print(f"Error initializing comparator: {str(e)}")
        app.comparator = None

    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'message': 'Law comparison system is running'
        })

    @app.route('/compare', methods=['POST'])
    def compare_laws():
        """Endpoint to compare law sections"""
        try:
            if not app.comparator:
                return jsonify({
                    'error': 'System not properly initialized'
                }), 500
            
            data = request.get_json()
            
            if not data or 'query' not in data:
                return jsonify({
                    'error': 'Missing query parameter'
                }), 400
            
            query = data['query']
            result = app.comparator.compare_versions(query)
            
            return jsonify({
                'result': result
            })
            
        except Exception as e:
            return jsonify({
                'error': str(e)
            }), 500

    @app.route('/search', methods=['POST'])
    def search_laws():
        """Endpoint to search law documents"""
        try:
            if not app.comparator:
                return jsonify({
                    'error': 'System not properly initialized'
                }), 500
            
            data = request.get_json()
            
            if not data or 'query' not in data:
                return jsonify({
                    'error': 'Missing query parameter'
                }), 400
            
            query = data['query']
            k = data.get('k', 2)  # Optional parameter for number of results
            
            results = app.comparator.search_law(query, k=k)
            
            return jsonify({
                'results': results
            })
            
        except Exception as e:
            return jsonify({
                'error': str(e)
            }), 500

    @app.route('/sources', methods=['GET'])
    def list_sources():
        """Endpoint to list available sources"""
        try:
            if not app.comparator:
                return jsonify({
                    'error': 'System not properly initialized'
                }), 500
            
            sources = app.comparator.list_available_sources()
            return jsonify({
                'sources': sources
            })
            
        except Exception as e:
            return jsonify({
                'error': str(e)
            }), 500

    return app

class LawComparison:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        os.environ['GOOGLE_API_KEY'] = os.getenv("GOOGLE_API_KEY")
        
        # Initialize models
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        self.llm = GoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.1)
        
        # Load the vector store
        try:
            self.vectors = FAISS.load_local("my_vector_store", self.embeddings, allow_dangerous_deserialization=True)
            print("Vector store loaded successfully")
        except Exception as e:
            raise Exception(f"Error loading vector store: {str(e)}")
    
    def search_law(self, query, k=2):
        """Search for relevant law documents"""
        try:
            # Search using similarity search
            docs_and_scores = self.vectors.similarity_search_with_score(query, k=k)
            
            results = []
            for doc, score in docs_and_scores:
                result = {
                    'content': doc.page_content,
                    'metadata': doc.metadata,
                    'similarity': float(score)  # Convert numpy float to Python float for JSON serialization
                }
                results.append(result)
            
            return results
            
        except Exception as e:
            print(f"Search error: {str(e)}")
            return []
    
    def compare_versions(self, query):
        try:
        # Get relevant documents
            results = self.search_law(query, k=2)
        
            if not results:
                return "Error: Could not find relevant law sections."
        
            if len(results) < 2:
                return "Error: Could not find multiple versions or sections for comparison."
        
        # Simplified prompt focused on evolution and changes
            prompt = f"""Compare these two versions of legal text and explain specifically how the law has evolved:

Text 1 (from {results[0]['metadata'].get('source', 'unknown source')}):
{results[0]['content']}

Text 2 (from {results[1]['metadata'].get('source', 'unknown source')}):
{results[1]['content']}

Please provide a clear, focused explanation of:
1. What specific changes were made to the law
2. How the requirements or obligations have evolved
3. What this evolution means in practical terms

Focus solely on explaining how the law has changed from one version to the next. Provide concrete examples from the texts to support your explanation."""

        # Get comparison from Gemini
            response = self.llm.invoke(prompt)
            return str(response)
    
        except Exception as e:
            return f"Error during comparison: {str(e)}"
    
    def list_available_sources(self):
        """List all available source documents"""
        try:
            # Get all documents
            all_docs = self.vectors.similarity_search("", k=1000)  # Adjust k as needed
            
            # Extract unique source files
            sources = set()
            for doc in all_docs:
                if 'source' in doc.metadata:
                    sources.add(doc.metadata['source'])
            
            return sorted(list(sources))
            
        except Exception as e:
            print(f"Error listing sources: {str(e)}")
            return []

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5001, debug=True)