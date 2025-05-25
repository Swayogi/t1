from flask import Flask, request, jsonify
from phishing_detector import predict_phishing, extract_url_features # Assuming phishing_detector.py is in the same directory

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    url_to_check = data.get('url')

    if not url_to_check:
        return jsonify({'error': 'URL is required'}), 400

    try:
        # In a real application, the model and vectorizer would be loaded once at startup,
        # not re-trained or re-fitted on each call.
        # The phishing_detector.py script already "trains" its model upon import.
        
        prediction_result = predict_phishing(url_to_check)
        
        return jsonify(prediction_result)
        
    except Exception as e:
        # Log the exception for debugging
        app.logger.error(f"Error during prediction for URL '{url_to_check}': {e}")
        return jsonify({'error': 'Prediction failed', 'details': str(e)}), 500

@app.route('/extract_features', methods=['POST'])
def extract():
    data = request.get_json()
    url_to_check = data.get('url')

    if not url_to_check:
        return jsonify({'error': 'URL is required'}), 400
    
    try:
        features = extract_url_features(url_to_check) # This returns a string in the current placeholder
        # For a more useful feature extraction endpoint, you might want a dictionary or list
        return jsonify({'url': url_to_check, 'features_string': features})
    except Exception as e:
        app.logger.error(f"Error during feature extraction for URL '{url_to_check}': {e}")
        return jsonify({'error': 'Feature extraction failed', 'details': str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    # Basic health check endpoint
    return jsonify({'status': 'healthy', 'message': 'ML Model API is running.'})

if __name__ == '__main__':
    # Note: For development only. Use a production WSGI server (e.g., Gunicorn) for deployment.
    # The phishing_detector.py script trains its dummy model when imported.
    # So the model should be "ready" when the Flask app starts.
    print("Starting ML Model API server...")
    app.run(host='0.0.0.0', port=5000, debug=True) # debug=True is not for production
