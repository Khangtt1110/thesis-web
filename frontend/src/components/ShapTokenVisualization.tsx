import React from 'react';
import { ShapTokenValue } from '../types';

interface ShapTokenVisualizationProps {
  tokenValues: ShapTokenValue[];
}

const ShapTokenVisualization: React.FC<ShapTokenVisualizationProps> = ({ tokenValues }) => {
  if (!tokenValues || tokenValues.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Token-Level SHAP Explanation</h2>
        <p className="text-gray-600">No token-level data available</p>
      </div>
    );
  }

  const getColor = (value: number): string => {
    const intensity = Math.min(Math.abs(value) * 2, 1);
    if (value > 0) {
      return `rgba(59, 130, 246, ${intensity})`; // Blue for positive
    } else {
      return `rgba(239, 68, 68, ${intensity})`; // Red for negative
    }
  };

  const maxImportance = Math.max(...tokenValues.map(t => t.importance));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Token-Level SHAP Explanation</h2>
      <p className="text-sm text-gray-600 mb-4">
        Color intensity shows how much each token contributed to the prediction. 
        Blue = increases probability, Red = decreases probability.
      </p>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {tokenValues.map((item, index) => (
          <div
            key={index}
            className="px-3 py-2 rounded-lg cursor-pointer transition-transform hover:scale-105"
            style={{
              backgroundColor: getColor(item.value),
              color: Math.abs(item.value) > 0.3 ? 'white' : 'black',
              border: '1px solid #e5e7eb'
            }}
            title={`Importance: ${item.importance.toFixed(4)}`}
          >
            <span className="font-medium">{item.token}</span>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Token Importance Ranking</h3>
        <div className="space-y-2">
          {tokenValues
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 10)
            .map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.token}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(item.importance / maxImportance) * 100}%`,
                        backgroundColor: item.value > 0 ? '#3b82f6' : '#ef4444'
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {item.importance.toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ShapTokenVisualization;
