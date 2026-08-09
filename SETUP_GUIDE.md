# Quick Setup Guide

## Installation

1. **Install all dependencies:**
```bash
npm run install:all
```

2. **Install Python dependencies:**
```bash
cd python-service
pip3 install -r requirements.txt
```

## Setup Model

### Option 1: Use Your Own Model
Place your trained PyTorch model in `python-service/models/` and update the configuration.

### Option 2: Create Mock Model (for testing)
```bash
cd python-service
python3 test_mode.py
```

## Running the Application

### Start All Services

**Terminal 1 - Python ML Service:**
```bash
cd python-service
python3 app.py
```

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

### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Python Service: http://localhost:5001

## Testing

1. Open http://localhost:5173 in your browser
2. Enter symptom text (e.g., "I have a fever and cough")
3. Click "Analyze Symptoms"
4. View the classification results and SHAP visualizations

## Configuration Files

- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration  
- `python-service/config.py` - Python service configuration

## Troubleshooting

- **Port conflicts**: Change ports in respective config files
- **Model not loading**: Run `python3 test_mode.py` to create a mock model
- **CORS errors**: Check backend CORS configuration
- **Python version**: Ensure Python 3.8+ is installed
