from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from gradio_client import Client, file
import google.generativeai as genai
import os

# Configure the GenAI API
try:
    genai.configure(api_key=os.getenv("GENAI_API_KEY", "AIzaSyCaMUsyaIG6IK_AmVWLj6CEyNTUgpQQWR4"))
    model = genai.GenerativeModel("gemini-1.5-flash")
except Exception as e:
    raise RuntimeError(f"Failed to configure GenAI: {e}")

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Gradio Client
try:
    client = Client("tonyassi/voice-clone")
except Exception as e:
    raise RuntimeError(f"Failed to initialize Gradio client: {e}")

@app.route('/generatevoice', methods=['POST'])
def predict():
    try:
        # Parse request data
        data = request.json
        if not data:
            return jsonify({"error": "Request body must be JSON."}), 400

        text = data.get('text')
        print(text)
        tone = data.get('tone')  # Optional parameter
        context = data.get('context')  # Optional parameter
        max_tokens = data.get('max_tokens', 100)  # Default to 100 tokens

        if not text:
            return jsonify({"error": "'text' field is required."}), 400

        # Build the prompt dynamically based on provided inputs
        prompt_parts = ["Give a reply"]
        prompt_parts.append(f"to the question: {text}")
        if tone:
            prompt_parts.append(f"with a tone: {tone}")
        if context:
            prompt_parts.append(f"in the context of: {context}")
        prompt = " ".join(prompt_parts)
    
        # Generate content using GenAI
        try:
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    max_output_tokens=max_tokens,
                )
            )
        except Exception as e:
            return jsonify({"error": f"Failed to generate content: {e}"}), 500

        # Log the response for debugging
        print("Generated Response:", response.text)

        # Predict using the audio file
        audio_file_path = "https://res.cloudinary.com/dcntuufh9/video/upload/v1737652425/csqp1ebjrtz4mdqg3zth.wav"

        try:
            result = client.predict(
                text=response.text,
                audio=file(audio_file_path),
                api_name="/predict",
            )
            print(result)
        except Exception as e:
            return jsonify({"error": f"Failed to generate audio prediction: {e}"}), 500

        # Ensure result is a valid file path
        if not os.path.exists(result):
            return jsonify({"error": "Generated audio file not found."}), 500

        return send_file(result, as_attachment=True)

    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True)