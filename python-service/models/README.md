# Model Files Directory

Place your trained PyTorch model file in this directory.

## ⚠️ Important

**Do not commit model files to Git.** This directory is gitignored to prevent large file uploads.

## Expected Model Format

Your model should be one of the following:

1. **Hugging Face Format**: A directory containing `config.json` and model weights
2. **PyTorch .pt file**: A single `.pt` or `.pth` file

## File Naming

- Default expected filename: `disease_classifier.pt`
- Or specify custom path via `MODEL_PATH` environment variable

## Example Setup

```bash
# If your model is named differently, create a symlink
ln -s /path/to/your/model.pt disease_classifier.pt

# Or set the environment variable
export MODEL_PATH=/path/to/your/model.pt
```

## Tokenizer

If using a custom tokenizer, place it in this directory or specify via:
```bash
export TOKENIZER_PATH=/path/to/your/tokenizer
```

## Model Requirements

- Text classification model
- Compatible with Hugging Face transformers
- Output classes should match CLASS_LABELS in config.py

## For Testing

To create a mock model for testing purposes, run:
```bash
cd python-service
python3 test_mode.py
```

This will download a pre-trained BERT model for testing without committing large files to the repository.
