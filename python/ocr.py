from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import torch

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the summarization pipeline with BART
# Using facebook/bart-large-cnn model which is good for summarization
# You can also try 'sshleifer/distilbart-cnn-12-6' for a lighter model
summarizer = pipeline(
    "summarization",
    model="facebook/bart-large-cnn",
    device=0 if torch.cuda.is_available() else -1  # Use GPU if available
)

def chunk_text(text, max_chunk_size=1024):
    """
    Split text into chunks that the model can process
    """
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
    """
    Summarize legal document text using BART model
    """
    try:
        # Split text into chunks if it's too long
        chunks = chunk_text(text)
        
        # Summarize each chunk
        summaries = []
        for chunk in chunks:
            # Skip empty or very short chunks
            if len(chunk.split()) < 10:
                continue
                
            summary = summarizer(chunk, 
                               max_length=150,
                               min_length=30,
                               do_sample=False)
            summaries.append(summary[0]['summary_text'])
        
        # Combine summaries
        final_summary = ' '.join(summaries)
        
        # If the text was very short and didn't need chunking
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

@app.route('/api/summarize', methods=['POST'])
def summarize():
    try:
        # Get the OCR text from the request
        data = request.json
        ocr_text = data.get('text')
        
        if not ocr_text:
            return jsonify({
                'error': 'No text provided'
            }), 400

        # Clean the text - remove excessive whitespace and normalize
        cleaned_text = ' '.join(ocr_text.split())

        # Generate summary
        summary = summarize_legal_document(cleaned_text)
        
        if summary is None:
            return jsonify({
                'error': 'Failed to generate summary'
            }), 500

        # Return the summary
        return jsonify({
            'summary': summary,
            'original_text': cleaned_text
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)