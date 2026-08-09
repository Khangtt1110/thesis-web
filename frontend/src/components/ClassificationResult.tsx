import React from 'react';
import { PredictionResponse } from '../types';

interface ClassificationResultProps {
  result: PredictionResponse;
}

const ClassificationResult: React.FC<ClassificationResultProps> = ({ result }) => {
  const confidencePercentage = (result.confidence * 100).toFixed(1);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Classification Result</h2>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold text-gray-700">Predicted Condition:</span>
            <span className="text-2xl font-bold text-blue-600">{result.label}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Confidence:</span>
            <span className="text-lg font-semibold text-green-600">{confidencePercentage}%</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">All Class Probabilities</h3>
          <div className="space-y-2">
            {Object.entries(result.class_probabilities)
              .sort(([, a], [, b]) => b - a)
              .map(([label, probability]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(probability * 100).toFixed(1)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {(probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassificationResult;
