import express, { Request, Response } from 'express';
import axios from 'axios';
import { PredictionRequest, PredictionResponse, ShapRequest, ShapResponse, ApiResponse } from '../types';

const router = express.Router();
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'prediction-api' });
});

// Classification prediction
router.post('/predict', async (req: Request, res: Response) => {
  try {
    const { text }: PredictionRequest = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid text input is required'
      } as ApiResponse<never>);
    }

    const response = await axios.post<PredictionResponse>(
      `${PYTHON_SERVICE_URL}/predict`,
      { text }
    );

    res.json({
      success: true,
      data: response.data
    } as ApiResponse<PredictionResponse>);

  } catch (error: any) {
    console.error('Prediction error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.error || 'Prediction service error'
      } as ApiResponse<never>);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to connect to prediction service'
    } as ApiResponse<never>);
  }
});

// SHAP explanation
router.post('/shap', async (req: Request, res: Response) => {
  try {
    const { text, level = 'both' }: ShapRequest = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid text input is required'
      } as ApiResponse<never>);
    }

    const response = await axios.post<ShapResponse>(
      `${PYTHON_SERVICE_URL}/shap`,
      { text, level }
    );

    res.json({
      success: true,
      data: response.data
    } as ApiResponse<ShapResponse>);

  } catch (error: any) {
    console.error('SHAP error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.error || 'SHAP service error'
      } as ApiResponse<never>);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to connect to SHAP service'
    } as ApiResponse<never>);
  }
});

export default router;
