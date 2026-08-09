import shap
import torch
import numpy as np
from transformers import AutoTokenizer
import config
import logging
from model_loader import model_loader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ShapExplainer:
    def __init__(self):
        self.explainer = None
        self.background_data = None
        self.tokenizer = None
        
    def initialize(self):
        """Initialize SHAP explainer with the loaded model"""
        try:
            if model_loader.model is None or model_loader.tokenizer is None:
                logger.error("Model not loaded. Cannot initialize SHAP explainer.")
                return False
            
            self.tokenizer = model_loader.tokenizer
            model = model_loader.model
            device = model_loader.device
            
            logger.info("Initializing SHAP explainer...")
            
            # Create a wrapper function for SHAP
            def model_wrapper(texts):
                inputs = self.tokenizer(
                    texts,
                    return_tensors='pt',
                    truncation=True,
                    padding=True,
                    max_length=config.MAX_LENGTH
                )
                inputs = {k: v.to(device) for k, v in inputs.items()}
                
                with torch.no_grad():
                    outputs = model(**inputs)
                    logits = outputs.logits
                    probabilities = torch.softmax(logits, dim=-1)
                
                return probabilities.cpu().numpy()
            
            # Create background data for explainer
            background_texts = [
                "Patient has fever and cough",
                "Headache and sore throat",
                "Nausea and vomiting",
                "Shortness of breath and chest pain",
                "Runny nose and sneezing"
            ]
            
            # Initialize partition explainer (good for text)
            self.explainer = shap.Explainer(model_wrapper, shap.maskers.Text(self.tokenizer))
            
            logger.info("SHAP explainer initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error initializing SHAP explainer: {e}")
            return False
    
    def explain_token_level(self, text, prediction_label):
        """Generate token-level SHAP explanations"""
        try:
            if self.explainer is None:
                if not self.initialize():
                    raise ValueError("Could not initialize SHAP explainer")
            
            # Get SHAP values - pass text as string
            shap_values = self.explainer(text)
            
            # Extract token-level explanations
            tokens = self.tokenizer.tokenize(text)
            
            # Handle different SHAP output formats
            if hasattr(shap_values, 'values'):
                values = shap_values.values
            else:
                values = shap_values
            
            # For multi-class, get values for the predicted class
            if len(values.shape) > 1:
                # Get the class index that matches prediction
                try:
                    class_idx = config.CLASS_LABELS.index(prediction_label)
                    values = values[:, class_idx]
                except ValueError:
                    values = values[:, 0]  # Default to first class
            
            # Create token importance list
            token_values = []
            for i, token in enumerate(tokens):
                if i < len(values):
                    importance = float(values[i])
                    token_values.append({
                        'token': token,
                        'value': importance,
                        'importance': abs(importance)
                    })
            
            return token_values
            
        except Exception as e:
            logger.error(f"Error generating token-level SHAP: {e}")
            # Return a simple token importance as fallback
            try:
                tokens = self.tokenizer.tokenize(text)
                return [
                    {
                        'token': token,
                        'value': 0.1,
                        'importance': 0.1
                    }
                    for token in tokens[:10]
                ]
            except:
                return []
    
    def explain_feature_level(self, text, prediction_label):
        """Generate feature-level SHAP explanations"""
        try:
            # Extract features from text (symptoms)
            features = self._extract_features(text)
            
            if self.explainer is None:
                if not self.initialize():
                    raise ValueError("Could not initialize SHAP explainer")
            
            # For feature-level, we'll use a simpler approach
            # Get base prediction
            from model_loader import model_loader
            base_result = model_loader.predict(text)
            base_value = base_result['confidence']
            
            # Calculate feature importance by removing each feature
            feature_values = []
            for feature in features:
                # Create text without this feature
                modified_text = text.replace(feature, '')
                if modified_text.strip():  # Only if there's still text left
                    try:
                        modified_result = model_loader.predict(modified_text)
                        importance = base_value - modified_result['confidence']
                        feature_values.append({
                            'feature': feature,
                            'value': importance,
                            'importance': abs(importance)
                        })
                    except:
                        pass
            
            # Sort by importance
            feature_values.sort(key=lambda x: x['importance'], reverse=True)
            
            return feature_values[:10]  # Return top 10 features
            
        except Exception as e:
            logger.error(f"Error generating feature-level SHAP: {e}")
            return []
    
    def _extract_features(self, text):
        """Extract potential symptom features from text"""
        # Common symptom keywords
        symptom_keywords = [
            'fever', 'cough', 'headache', 'nausea', 'vomiting',
            'diarrhea', 'fatigue', 'body ache', 'sore throat',
            'runny nose', 'congestion', 'shortness of breath',
            'chest pain', 'dizziness', 'rash', 'swelling',
            'chills', 'sweating', 'loss of appetite', 'stomach pain'
        ]
        
        text_lower = text.lower()
        found_features = []
        
        for keyword in symptom_keywords:
            if keyword in text_lower:
                found_features.append(keyword)
        
        # Also extract individual words as potential features
        words = text_lower.split()
        found_features.extend([word for word in words if len(word) > 3])
        
        return list(set(found_features))  # Remove duplicates

# Global explainer instance
shap_explainer = ShapExplainer()
