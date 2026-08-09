import shap
import torch
import numpy as np
from transformers import AutoTokenizer
import config
import logging
from model_loader import model_loader
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import base64
import io

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
                # Handle different input types from SHAP
                if isinstance(texts, str):
                    texts = [texts]
                elif isinstance(texts, list) and len(texts) > 0 and isinstance(texts[0], list):
                    # Handle batch of pretokenized examples
                    texts = [' '.join(t) for t in texts]
                
                # Filter out any non-string inputs
                valid_texts = [t for t in texts if isinstance(t, str)]
                if not valid_texts:
                    # Return default output if no valid texts
                    return np.zeros((1, len(config.CLASS_LABELS)))
                
                inputs = self.tokenizer(
                    valid_texts,
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
        """Generate token-level SHAP explanations for text plot visualization"""
        try:
            if self.explainer is None:
                if not self.initialize():
                    raise ValueError("Could not initialize SHAP explainer")
            
            # Get SHAP values - pass text as string
            shap_values = self.explainer(text)
            
            # Extract token-level explanations for text plot
            # Get the original text and tokenize it
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
            
            # Create token importance list optimized for text plot
            token_values = []
            for i, token in enumerate(tokens):
                if i < len(values):
                    shap_value = float(values[i])
                    token_values.append({
                        'token': token,
                        'value': shap_value,
                        'importance': abs(shap_value),
                        'position': i
                    })
            
            # Also add position to feature-level results for consistency
            for i, token_val in enumerate(token_values):
                if 'position' not in token_val:
                    token_val['position'] = i
            
            # Also return the base value and prediction for text plot
            return {
                'token_values': token_values,
                'base_value': 0.0,  # Will be set by caller
                'prediction': prediction_label,
                'text': text
            }
            
        except Exception as e:
            logger.error(f"Error generating token-level SHAP: {e}")
            # Return a simple token importance as fallback
            try:
                tokens = self.tokenizer.tokenize(text)
                return {
                    'token_values': [
                        {
                            'token': token,
                            'value': 0.1,
                            'importance': 0.1,
                            'position': i
                        }
                        for i, token in enumerate(tokens[:10])
                    ],
                    'base_value': 0.0,
                    'prediction': prediction_label,
                    'text': text
                }
            except:
                return {
                    'token_values': [],
                    'base_value': 0.0,
                    'prediction': prediction_label,
                    'text': text
                }
    
    def generate_shap_plot(self, text, prediction_label):
        """Generate actual SHAP text plot using matplotlib (exactly as in SHAP docs)"""
        try:
            if self.explainer is None:
                if not self.initialize():
                    raise ValueError("Could not initialize SHAP explainer")
            
            # Get SHAP values - pass as string for single example
            shap_values = self.explainer(text)
            
            # Create figure for SHAP plot
            plt.figure(figsize=(12, 6))
            
            # Generate the SHAP text plot exactly as in documentation
            # Handle different shap_values formats
            if hasattr(shap_values, 'values'):
                # If it's a multi-class output, get the specific class
                if len(shap_values.values.shape) > 1:
                    try:
                        class_idx = config.CLASS_LABELS.index(prediction_label)
                        # Create a single-class shap_values object
                        from shap import Explanation
                        single_class_values = shap_values.values[:, class_idx]
                        single_class_shap = Explanation(
                            values=single_class_values,
                            base_values=shap_values.base_values[class_idx] if len(shap_values.base_values.shape) > 0 else shap_values.base_values,
                            data=shap_values.data
                        )
                        shap.plots.text(single_class_shap, display=False)
                    except (ValueError, IndexError):
                        # Fallback to first class
                        shap.plots.text(shap_values, display=False)
                else:
                    shap.plots.text(shap_values, display=False)
            else:
                shap.plots.text(shap_values, display=False)
            
            # Save plot to base64 string
            buf = io.BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight', dpi=150)
            buf.seek(0)
            plot_base64 = base64.b64encode(buf.read()).decode('utf-8')
            plt.close()
            
            return {
                'plot_base64': plot_base64,
                'plot_type': 'text',
                'prediction': prediction_label,
                'text': text
            }
            
        except Exception as e:
            logger.error(f"Error generating SHAP plot: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return None
    
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
        """Extract potential symptom features from text (Vietnamese and English)"""
        # Common symptom keywords in Vietnamese and English
        symptom_keywords = [
            # Vietnamese symptoms
            'sốt', 'ho', 'đau đầu', 'buồn nôn', 'nôn',
            'tiêu chảy', 'mệt mỏi', 'đau người', 'đau họng',
            'chảy mũi', 'nghẹt mũi', 'khó thở',
            'đau ngực', 'chóng mặt', 'phát ban', 'sưng',
            'rét run', 'vã mồ hôi', 'không ngon miệng', 'đau bụng',
            # English symptoms (for bilingual support)
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
        found_features.extend([word for word in words if len(word) > 2])
        
        return list(set(found_features))  # Remove duplicates

# Global explainer instance
shap_explainer = ShapExplainer()
