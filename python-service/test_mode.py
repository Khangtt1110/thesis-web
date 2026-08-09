"""
Test mode for the disease classifier service.
This creates a mock model for testing when the actual PyTorch model is not available.
"""

from transformers import AutoModelForSequenceClassification, AutoTokenizer
import config
import logging
import torch

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_mock_model():
    """Create and save a mock model for testing using PhoBert (Vietnamese BERT)"""
    logger.info("Creating mock model for testing...")
    
    try:
        # Create models directory
        from pathlib import Path
        models_dir = Path(config.MODEL_PATH).parent
        models_dir.mkdir(parents=True, exist_ok=True)
        
        # Use PhoBert (Vietnamese BERT) model as a mock
        logger.info("Downloading PhoBert model for testing...")
        model_name = "vinai/phobert-base"  # Vietnamese BERT model
        
        # Load pre-trained model
        model = AutoModelForSequenceClassification.from_pretrained(
            model_name, 
            num_labels=len(config.CLASS_LABELS)
        )
        
        # Save the model in Hugging Face format
        model_path = models_dir / "phobert_model"
        model.save_pretrained(str(model_path))
        logger.info(f"Mock model saved to {model_path}")
        
        # Save tokenizer
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        tokenizer.save_pretrained(str(model_path))
        logger.info(f"Tokenizer saved to {model_path}")
        
        # Update config to use the new model path
        config.MODEL_PATH = str(model_path)
        config.TOKENIZER_PATH = str(model_path)
        
        logger.info("✅ PhoBert model downloaded successfully!")
        logger.info("⚠️  Note: The model files are in a gitignored directory.")
        logger.info("⚠️  They will not be committed to the repository.")
        logger.info("⚠️  Other developers will need to run this script locally.")
        
        return True
        
    except Exception as e:
        logger.error(f"Error creating mock model: {e}")
        logger.info("Falling back to BERT-base model...")
        
        # Fallback to BERT if PhoBert fails
        try:
            model_name = "bert-base-uncased"
            model = AutoModelForSequenceClassification.from_pretrained(
                model_name, 
                num_labels=len(config.CLASS_LABELS)
            )
            
            model_path = models_dir / "bert_model"
            model.save_pretrained(str(model_path))
            logger.info(f"Fallback BERT model saved to {model_path}")
            
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            tokenizer.save_pretrained(str(model_path))
            logger.info(f"Fallback tokenizer saved to {model_path}")
            
            config.MODEL_PATH = str(model_path)
            config.TOKENIZER_PATH = str(model_path)
            
            return True
        except Exception as fallback_error:
            logger.error(f"Fallback also failed: {fallback_error}")
            return False

if __name__ == '__main__':
    if create_mock_model():
        print("✓ Mock model created successfully")
        print(f"  Model path: {config.MODEL_PATH}")
        print("You can now run the Python service with: python3 app.py")
    else:
        print("✗ Failed to create mock model")
