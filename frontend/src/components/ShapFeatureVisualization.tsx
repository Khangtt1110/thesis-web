import React from 'react';
import { ShapFeatureValue } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ShapFeatureVisualizationProps {
  featureValues: ShapFeatureValue[];
}

const ShapFeatureVisualization: React.FC<ShapFeatureVisualizationProps> = ({ featureValues }) => {
  if (!featureValues || featureValues.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Feature-Level SHAP Explanation</h2>
        <p className="text-gray-600">No feature-level data available</p>
      </div>
    );
  }

  const chartData = featureValues.map(item => ({
    name: item.feature,
    importance: item.importance,
    value: item.value
  }));

  const maxImportance = Math.max(...featureValues.map(f => f.importance));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Feature-Level SHAP Explanation</h2>
      <p className="text-sm text-gray-600 mb-4">
        Shows which symptoms/features had the most impact on the prediction.
      </p>

      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Bar 
              dataKey="importance" 
              fill="#3b82f6"
              name="Importance"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Feature Importance Details</h3>
        <div className="space-y-2">
          {featureValues.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <span className="font-medium text-gray-800">{item.feature}</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({item.value > 0 ? '+' : ''}{item.value.toFixed(4)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(item.importance / maxImportance) * 100}%`,
                      backgroundColor: item.value > 0 ? '#3b82f6' : '#ef4444'
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-12 text-right">
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

export default ShapFeatureVisualization;
