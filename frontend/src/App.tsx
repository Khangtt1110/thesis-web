import React, { useState } from 'react';
import SymptomInput from './components/SymptomInput';
import ClassificationResult from './components/ClassificationResult';
import ShapTokenVisualization from './components/ShapTokenVisualization';
import ShapFeatureVisualization from './components/ShapFeatureVisualization';
import ShapTextPlot from './components/ShapTextPlot';
import { predictionApi } from './services/api';
import { PredictionResponse, ShapResponse } from './types';

const App: React.FC = () => {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [shapData, setShapData] = useState<ShapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    setShapData(null);

    try {
      // Get prediction
      const predictionResult = await predictionApi.predict(text);
      setPrediction(predictionResult);

      // Get SHAP explanation
      const shapResult = await predictionApi.getShapExplanation(text, 'both');
      setShapData(shapResult);

    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Disease Symptom Classifier
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered disease classification with explainable AI insights
          </p>
        </div>

        <SymptomInput onSubmit={handleAnalyze} isLoading={isLoading} />

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mt-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Analyzing symptoms and generating explanations...</p>
          </div>
        )}

        {prediction && !isLoading && (
          <>
            <ClassificationResult result={prediction} />
            
            {shapData && (
              <>
                {shapData.text_plot_data && (
                  <ShapTextPlot textPlotData={shapData.text_plot_data} />
                )}
                {shapData.token_values && (
                  <ShapTokenVisualization tokenValues={shapData.token_values} />
                )}
                {shapData.feature_values && (
                  <ShapFeatureVisualization featureValues={shapData.feature_values} />
                )}
              </>
            )}
          </>
        )}

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Powered by local PyTorch model with SHAP explainability</p>
          <p className="mt-1">Note: This is a demonstration tool and should not be used for medical diagnosis</p>
        </div>
      </div>
    </div>
  );
};

export default App;
