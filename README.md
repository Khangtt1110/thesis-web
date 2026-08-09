# Disease Symptom Classifier with SHAP Visualization

A full-stack web application for disease symptom classification using a local PyTorch model with explainable AI (SHAP) visualizations showing token and feature importance.

## Architecture

The application consists of three main components:

- **Frontend**: React + TypeScript web interface for symptom input and visualization
- **Backend**: Node.js/Express API server that acts as a gateway
- **ML Service**: Python Flask service that loads the PyTorch model and generates SHAP explanations

## Features

- Text input for disease symptoms
- Real-time classification predictions using local PyTorch model
- Token-level SHAP visualization (color-coded word importance)
- Feature-level SHAP visualization (importance rankings and charts)
- Multi-class probability display
- Error handling and loading states

## Prerequisites

- Node.js (v18 or higher)
- Python (3.8 or higher)
- pip
- npm or yarn

## Setup Instructions

### 1. Clone and Navigate

```bash
cd /path/to/web
```

### 2. Install Dependencies

Install all dependencies for the project:

```bash
npm run install:all
```

Or install individually:

```bash
# Root dependencies
npm install

# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install

# Python dependencies
cd ../python-service
pip install -r requirements.txt
```

### 3. Model Setup

**Important**: You need to place your trained PyTorch model in the designated location.

#### Option 1: Place Model in Default Location

```bash
# Create models directory if it doesn't exist
mkdir -p python-service/models

# Copy your trained model to this location
# Your model file should be named: disease_classifier.pt
# Or specify the path in environment variables
```

#### Option 2: Use Custom Model Path

Set the `MODEL_PATH` environment variable:

```bash
export MODEL_PATH=/path/to/your/model.pt
export TOKENIZER_PATH=/path/to/your/tokenizer
```

#### Model Requirements

Your PyTorch model should be:
- A text classification model (e.g., BERT-based)
- Compatible with Hugging Face transformers format
- Include a tokenizer if using custom preprocessing

### 4. Configuration

#### Backend Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` if needed:
```env
PORT=3001
PYTHON_SERVICE_URL=http://localhost:5000
```

#### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
cp .env.example .env
```

Edit `.env` if needed:
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

#### Python Service Configuration

You can modify `python-service/config.py` to adjust:
- Model path and type
- Class labels (should match your model's output classes)
- SHAP configuration
- Flask server settings

### 5. Update Class Labels

Edit `python-service/config.py` to match your model's class labels:

```python
CLASS_LABELS = [
    'Cold',
    'Flu', 
    'COVID-19',
    # Add your model's classes here
]
```

## Running the Application

### Quick Start with Mock Model

For testing purposes, a mock model can be created automatically:

```bash
cd python-service
python3 test_mode.py
```

This will download a pre-trained BERT model and set it up for testing.

### Option 1: Run All Services

In separate terminals, run each service:

**Terminal 1 - Python ML Service:**
```bash
cd python-service
python3 app.py
```

*Note: Use `python3` on macOS/Linux, or `python` on Windows.*

**Terminal 2 - Node.js Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - React Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Run Backend and Frontend Together

```bash
# In one terminal
npm run dev
```

Then start the Python service in another terminal:
```bash
cd python-service
python3 app.py
```

## Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Python Service: http://localhost:5001

## API Endpoints

### Backend API (Node.js)

- `GET /` - API information
- `GET /api/health` - Health check
- `POST /api/predict` - Make prediction
  - Body: `{ "text": "symptom description" }`
  - Response: `{ "label": "disease", "confidence": 0.95, "class_probabilities": {...} }`
- `POST /api/shap` - Get SHAP explanation
  - Body: `{ "text": "symptom description", "level": "token|feature|both" }`
  - Response: `{ "token_values": [...], "feature_values": [...], "base_value": 0.5, "prediction": "disease" }`

### Python Service (Flask)

- `GET /` - Service information
- `GET /health` - Health check with model status
- `POST /predict` - Make prediction
- `POST /shap` - Generate SHAP explanations

## Project Structure

```
web/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── predict.ts       # API routes
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript types
│   │   └── server.ts            # Express server
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SymptomInput.tsx
│   │   │   ├── ClassificationResult.tsx
│   │   │   ├── ShapTokenVisualization.tsx
│   │   │   └── ShapFeatureVisualization.tsx
│   │   ├── services/
│   │   │   └── api.ts           # API client
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
├── python-service/
│   ├── models/                  # Place your model here
│   ├── app.py                   # Flask application
│   ├── config.py                # Configuration
│   ├── model_loader.py          # PyTorch model loading
│   ├── shap_explainer.py        # SHAP explanation generation
│   └── requirements.txt
├── package.json                 # Root package.json
└── README.md
```

## Troubleshooting

### Model Loading Issues

If you see "Model not loaded" errors:
1. Check that your model file exists at the specified path
2. Verify the model format is compatible
3. Check Python service logs for detailed error messages
4. Ensure all required Python packages are installed
5. For testing, run `python3 test_mode.py` in the python-service directory to create a mock model

### Port Conflicts

If ports are already in use:
- Change `PORT` in `backend/.env`
- Change `FLASK_PORT` in `python-service/config.py` (default: 5001)
- Change port in `frontend/vite.config.ts`

### CORS Issues

If you encounter CORS errors:
- Verify the backend CORS configuration
- Check that frontend API URL is correct
- Ensure both services are running

### SHAP Performance

SHAP explanations can be computationally expensive:
- Reduce `SHAP_BACKGROUND_SIZE` in config
- Use simpler explainer types
- Consider caching results for repeated inputs

## Development

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```

### Adding New Features

- **New API endpoints**: Add to `backend/src/routes/predict.ts`
- **New visualizations**: Add components to `frontend/src/components/`
- **Model changes**: Update `python-service/config.py` and model loader

## Security Considerations

- Never commit model files with sensitive data
- Keep API keys and secrets in environment variables
- Add authentication for production deployments
- Validate and sanitize all user inputs
- Rate limit API endpoints in production

## Medical Disclaimer

**Important**: This application is for demonstration purposes only and should not be used for actual medical diagnosis. Always consult healthcare professionals for medical advice.

## License

MIT

## Support

For issues or questions, please check the troubleshooting section or review the service logs for detailed error messages.
