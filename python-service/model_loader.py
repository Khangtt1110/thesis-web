import torch
import os
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import config
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelLoader:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {self.device}")
        
    def load_model(self):
        """Load the PyTorch model and tokenizer"""
        try:
            model_path = Path(config.MODEL_PATH)
            
            if not model_path.exists():
                logger.warning(f"Model file not found at {model_path}")
                logger.info("Please place your trained PyTorch model at the specified location")
                return False
            
            logger.info(f"Loading model from {model_path}")
            
            # Check if it's a Hugging Face model directory or a single .pt file
            if model_path.is_dir():
                # Load from Hugging Face format
                self.model = AutoModelForSequenceClassification.from_pretrained(str(model_path))
                tokenizer_path = model_path
            else:
                # Load from .pt file - this assumes you have a separate tokenizer
                self.model = torch.load(model_path, map_location=self.device)
                tokenizer_path = config.TOKENIZER_PATH
            
            # Load tokenizer
            try:
                self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)
                logger.info("Tokenizer loaded successfully")
            except Exception as e:
                logger.warning(f"Could not load tokenizer from {tokenizer_path}: {e}")
                logger.info("Using default BERT tokenizer")
                self.tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
            
            # Move model to device and set to eval mode
            self.model.to(self.device)
            self.model.eval()
            
            logger.info("Model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False
    
    def predict(self, text):
        """Make prediction on input text"""
        if self.model is None or self.tokenizer is None:
            raise ValueError("Model not loaded. Please load the model first.")
        
        try:
            # Tokenize input
            inputs = self.tokenizer(
                text,
                return_tensors='pt',
                truncation=True,
                padding=True,
                max_length=config.MAX_LENGTH
            )
            
            # Move inputs to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Make prediction
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probabilities = torch.softmax(logits, dim=-1)
            
            # Get predicted class and confidence
            predicted_class_id = torch.argmax(probabilities, dim=-1).item()
            confidence = probabilities[0][predicted_class_id].item()
            
            # Get all class probabilities
            class_probabilities = {
                label: probabilities[0][i].item()
                for i, label in enumerate(config.CLASS_LABELS)
            }
            
            predicted_label = config.CLASS_LABELS[predicted_class_id] if predicted_class_id < len(config.CLASS_LABELS) else f"Class_{predicted_class_id}"
            
            return {
                'label': predicted_label,
                'confidence': confidence,
                'class_probabilities': class_probabilities
            }
            
        except Exception as e:
            logger.error(f"Error during prediction: {e}")
            raise

# Global model instance
model_loader = ModelLoader()
