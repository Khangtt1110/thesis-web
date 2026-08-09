import axios from 'axios';
import { PredictionResponse, ShapResponse, ApiResponse } from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const predictionApi = {
  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await api.get('/health');
    return response.data;
  },

  // Make prediction
  async predict(text: string): Promise<PredictionResponse> {
    const response = await api.post<ApiResponse<PredictionResponse>>('/predict', { text });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Prediction failed');
    }
    
    return response.data.data;
  },

  // Get SHAP explanation
  async getShapExplanation(text: string, level: 'token' | 'feature' | 'both' = 'both'): Promise<ShapResponse> {
    const response = await api.post<ApiResponse<ShapResponse>>('/shap', { text, level });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'SHAP explanation failed');
    }
    
    return response.data.data;
  },
};

export default api;
