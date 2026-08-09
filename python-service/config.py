import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent

# Model configuration
MODEL_PATH = os.environ.get('MODEL_PATH', str(BASE_DIR / 'models' / 'bert_model'))
MODEL_TYPE = os.environ.get('MODEL_TYPE', 'pytorch')  # 'pytorch', 'tensorflow', 'sklearn'

# Tokenizer configuration
TOKENIZER_PATH = os.environ.get('TOKENIZER_PATH', str(BASE_DIR / 'models' / 'bert_model'))
MAX_LENGTH = int(os.environ.get('MAX_LENGTH', 128))

# SHAP configuration
SHAP_BACKGROUND_SIZE = int(os.environ.get('SHAP_BACKGROUND_SIZE', 10))
SHAP_EXPLAINER_TYPE = os.environ.get('SHAP_EXPLAINER_TYPE', 'partition')  # 'partition', 'gradient', 'deep'

# Flask configuration
FLASK_HOST = os.environ.get('FLASK_HOST', '0.0.0.0')
FLASK_PORT = int(os.environ.get('FLASK_PORT', 5001))  # Changed from 5000 to avoid conflicts
FLASK_DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'  # Disabled debug mode to avoid forking issues

# Class labels (should match your model's classes)
CLASS_LABELS = [
    'Cold',
    'Flu',
    'COVID-19',
    'Allergies',
    'Migraine',
    'Food Poisoning',
    'Gastroenteritis',
    'Bronchitis',
    'Pneumonia',
    'Sinus Infection'
]
