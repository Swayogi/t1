import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import pandas as pd # For handling datasets, if we were loading one

# --- Feature Extraction ---
def extract_url_features(url):
    '''
    Extracts basic lexical features from a URL.
    This is a simplified example. Real-world models use more sophisticated features.
    '''
    features = {}
    features['url_length'] = len(url)
    features['hostname_length'] = len(url.split('/')[2]) if '/' in url else 0
    features['path_length'] = len(url.split('/', 3)[-1]) if url.count('/') > 2 else 0
    features['num_subdomains'] = url.count('.') - 1 # Simple count, might need refinement
    features['contains_ip'] = 1 if re.search(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', url) else 0
    features['contains_https'] = 1 if url.startswith('https://') else 0
    features['num_special_chars'] = len(re.findall(r'[-%@&=?#]', url))
    
    # Presence of suspicious keywords (very basic)
    suspicious_keywords = ['login', 'verify', 'account', 'secure', 'update', 'signin', 'admin', 'ebay', 'paypal']
    features['has_suspicious_keywords'] = 0
    for keyword in suspicious_keywords:
        if keyword in url.lower():
            features['has_suspicious_keywords'] = 1
            break
    
    # For a real model, you'd return a list or numpy array of feature values in a consistent order
    # For this placeholder, returning a dict is fine for now.
    # We will need a more structured feature vector for actual model training/prediction.
    # Example: [len(url), url.count('.'), ...]
    
    # Simplified: Return a string of features for TF-IDF vectorizer example
    # In a real scenario, you'd convert these dict features into a numerical vector
    feature_string = " ".join([f"{k}_{v}" for k, v in features.items()])
    return feature_string

# --- Model Training (Placeholder) ---
# In a real scenario, you would load a labeled dataset (URLs and their phishing status)
# For now, we'll create a tiny dummy dataset.
dummy_data = {
    'url': [
        "http://example-login.com/secure", 
        "https://legit-site.com/path",
        "http://123.45.67.89/update-info",
        "https://google.com",
        "http://paypal.com.phish.co/login",
        "https://www.mybank.com/personal/login"
    ],
    'label': [1, 0, 1, 0, 1, 0] # 1 for phishing, 0 for legitimate
}
df = pd.DataFrame(dummy_data)

# Feature extraction for the dummy dataset
# In reality, use the more structured feature vector from extract_url_features
X_features = [extract_url_features(url) for url in df['url']]
y_labels = df['label']

# Using TF-IDF as an example way to vectorize string features
# If extract_url_features returned numerical vectors, TF-IDF wouldn't be used directly on them.
vectorizer = TfidfVectorizer()
X_vectorized = vectorizer.fit_transform(X_features)

# Split data (though our dummy dataset is too small for a meaningful split)
# X_train, X_test, y_train, y_test = train_test_split(X_vectorized, y_labels, test_size=0.2, random_state=42)

# Train a simple model (Logistic Regression)
# For a real model, hyperparameter tuning and cross-validation would be important.
model = LogisticRegression()
try:
    # For a real dataset: model.fit(X_train, y_train)
    if X_vectorized.shape[0] > 1 : # Ensure there's enough data to fit
         model.fit(X_vectorized, y_labels) # Train on the full tiny dataset for this placeholder
         print("ML Model (Logistic Regression) trained on dummy data.")
    else:
        print("Dummy dataset too small to train model.")
except Exception as e:
    print(f"Error training model with dummy data: {e}")


# --- Prediction Function ---
def predict_phishing(url):
    '''
    Predicts if a URL is phishing using the trained model.
    '''
    if not model or not vectorizer:
        print("Model or vectorizer not available.")
        # Fallback or error handling
        # For this placeholder, let's assume non-phishing if model isn't ready
        return {'url': url, 'is_phishing': False, 'confidence': 0.0, 'error': 'Model not trained'}

    # Extract features and vectorize
    features_str = extract_url_features(url)
    vectorized_features = vectorizer.transform([features_str])
    
    # Make prediction
    try:
        prediction = model.predict(vectorized_features)[0] # 0 or 1
        confidence_scores = model.predict_proba(vectorized_features)[0]
        confidence = confidence_scores[prediction] # Confidence for the predicted class
        
        return {
            'url': url, 
            'is_phishing': bool(prediction), 
            'confidence': float(confidence)
        }
    except Exception as e:
        print(f"Error during prediction: {e}")
        return {'url': url, 'is_phishing': False, 'confidence': 0.0, 'error': str(e)}

# --- Example Usage (for testing this script directly) ---
if __name__ == '__main__':
    print("Phishing Detector Model (Placeholder)")
    
    test_urls = [
        "http://example-login.com/secure-update-info",
        "https://www.google.com",
        "http://some-random-site.com",
        "http://192.168.1.1/admin.html",
        "https://legitimatebank.com/signin/user"
    ]
    
    for test_url in test_urls:
        result = predict_phishing(test_url)
        print(f"URL: {result['url']}, Phishing: {result['is_phishing']}, Confidence: {result['confidence']:.2f}")
        if 'error' in result:
            print(f"  Error: {result['error']}")
