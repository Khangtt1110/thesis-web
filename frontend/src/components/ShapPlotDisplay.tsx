import React from 'react';

interface ShapPlotDisplayProps {
  shapPlot: {
    plot_base64: string;
    plot_type: string;
    prediction: string;
    text: string;
  };
}

const ShapPlotDisplay: React.FC<ShapPlotDisplayProps> = ({ shapPlot }) => {
  if (!shapPlot || !shapPlot.plot_base64) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">SHAP Text Plot</h2>
        <p className="text-gray-600">No SHAP plot data available</p>
      </div>
    );
  }

  const { plot_base64, prediction, text } = shapPlot;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">SHAP Text Plot</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <strong>Prediction:</strong> {prediction}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Input Text:</strong> "{text}"
        </p>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <img
          src={`data:image/png;base64,${plot_base64}`}
          alt="SHAP Text Plot"
          className="w-full h-auto"
          style={{ maxHeight: '600px' }}
        />
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">About SHAP Text Plot</h4>
        <p className="text-sm text-blue-700">
          This visualization shows how each word in the input text contributes to the model's prediction.
          Red words increase the probability of the predicted class, while blue words decrease it.
          The intensity of the color represents the magnitude of the contribution.
        </p>
      </div>
    </div>
  );
};

export default ShapPlotDisplay;
