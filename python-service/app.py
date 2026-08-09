from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import config
from model_loader import model_loader
from shap_explainer import shap_explainer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Load model on startup
logger.info("Loading model on startup...")
try:
    success = model_loader.load_model()
    if success:
        logger.info("Model loaded successfully")
        # Initialize SHAP explainer
        shap_explainer.initialize()
    else:
        logger.warning("Model loading failed. The service will return errors for prediction requests.")
except Exception as e:
    logger.warning(f"Model loading encountered an error: {e}")
    logger.warning("The service will start but prediction requests will fail until a model is provided.")

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        'service': 'Disease Classification ML Service',
        'version': '1.0.0',
        'status': 'running' if model_loader.model is not None else 'no_model_loaded',
        'endpoints': {
            'health': '/health',
            'predict': '/predict',
            'shap': '/shap'
        }
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model_loader.model is not None,
        'device': str(model_loader.device)
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Make prediction on input text"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Missing required field: text'
            }), 400
        
        text = data['text']
        
        if not isinstance(text, str):
            return jsonify({
                'error': 'Text must be a string'
            }), 400
        
        if model_loader.model is None:
            return jsonify({
                'error': 'Model not loaded. Please ensure the model file is placed at the correct location.'
            }), 503
        
        # Make prediction
        result = model_loader.predict(text)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/shap', methods=['POST'])
def explain():
    """Generate SHAP explanations for input text"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Missing required field: text'
            }), 400
        
        text = data['text']
        level = data.get('level', 'both')
        
        if not isinstance(text, str):
            return jsonify({
                'error': 'Text must be a string'
            }), 400
        
        if model_loader.model is None:
            return jsonify({
                'error': 'Model not loaded. Please ensure the model file is placed at the correct location.'
            }), 503
        
        # First get prediction
        prediction_result = model_loader.predict(text)
        prediction_label = prediction_result['label']
        
        # Generate explanations based on requested level
        result = {
            'base_value': prediction_result['confidence'],
            'prediction': prediction_label
        }
        
        if level in ['token', 'both']:
            token_data = shap_explainer.explain_token_level(text, prediction_label)
            # Handle both old format (list) and new format (dict)
            if isinstance(token_data, dict):
                result['token_values'] = token_data.get('token_values', [])
                result['text_plot_data'] = token_data
            else:
                result['token_values'] = token_data
        
        if level in ['feature', 'both']:
            feature_values = shap_explainer.explain_feature_level(text, prediction_label)
            result['feature_values'] = feature_values
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"SHAP explanation error: {e}")
        return jsonify({
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    logger.info(f"Starting Flask server on {config.FLASK_HOST}:{config.FLASK_PORT}")
    app.run(
        host=config.FLASK_HOST,
        port=config.FLASK_PORT,
        debug=config.FLASK_DEBUG
    )
