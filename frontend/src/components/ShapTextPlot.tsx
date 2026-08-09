import React from 'react';

interface ShapTextPlotProps {
  textPlotData: {
    token_values: Array<{
      token: string;
      value: number;
      importance: number;
      position?: number;
    }>;
    base_value: number;
    prediction: string;
    text: string;
  };
}

const ShapTextPlot: React.FC<ShapTextPlotProps> = ({ textPlotData }) => {
  if (!textPlotData || !textPlotData.token_values || textPlotData.token_values.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">SHAP Text Plot</h2>
        <p className="text-gray-600">No text plot data available</p>
      </div>
    );
  }

  const { token_values, base_value, prediction, text } = textPlotData;

  // Calculate color intensity based on SHAP values
  const getColor = (value: number): string => {
    const intensity = Math.min(Math.abs(value) * 3, 1); // Increased multiplier for better visibility
    if (value > 0) {
      return `rgba(59, 130, 246, ${intensity})`; // Blue for positive contribution
    } else {
      return `rgba(239, 68, 68, ${intensity})`; // Red for negative contribution
    }
  };

  const getTextColor = (value: number): string => {
    return Math.abs(value) > 0.15 ? 'white' : 'black';
  };

  const maxImportance = Math.max(...token_values.map(t => t.importance));

  // Reconstruct the text with SHAP highlighting
  const renderHighlightedText = () => {
    // Split the original text into words and match with tokens
    const words = text.split(/\s+/);
    let highlightedElements: React.ReactNode[] = [];
    let wordIndex = 0;

    token_values.forEach((tokenData, tokenIndex) => {
      const { token, value, importance } = tokenData;
      
      // Try to match token with words in original text
      let matchedWord = token.replace(/^[##]/, ''); // Remove BERT special tokens
      let displayWord = matchedWord;
      
      // Find the corresponding word in the original text
      if (wordIndex < words.length) {
        const originalWord = words[wordIndex];
        // Check if the token roughly matches the word
        if (originalWord.toLowerCase().includes(matchedWord.toLowerCase()) || 
            matchedWord.toLowerCase().includes(originalWord.toLowerCase())) {
          displayWord = originalWord;
          wordIndex++;
        }
      }

      const backgroundColor = getColor(value);
      const textColor = getTextColor(value);
      const tooltip = `${token}: ${value.toFixed(4)} (importance: ${importance.toFixed(4)})`;

      highlightedElements.push(
        <span
          key={tokenIndex}
          className="inline-block px-1 py-0.5 mx-0.5 rounded cursor-pointer transition-transform hover:scale-105"
          style={{
            backgroundColor,
            color: textColor,
            border: '1px solid rgba(0,0,0,0.1)'
          }}
          title={tooltip}
        >
          {displayWord}
        </span>
      );
    });

    return highlightedElements;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">SHAP Text Plot</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <strong>Prediction:</strong> {prediction}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Base Value:</strong> {base_value.toFixed(4)}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Token Importance Visualization</h3>
        <p className="text-sm text-gray-600 mb-4">
          Color intensity shows how much each token contributed to the prediction. 
          <span className="inline-block ml-2 px-2 py-1 rounded bg-blue-500 text-white">Blue</span> 
          increases probability, 
          <span className="inline-block ml-2 px-2 py-1 rounded bg-red-500 text-white">Red</span> 
          decreases probability.
        </p>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-lg leading-relaxed">
            {renderHighlightedText()}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Detailed Token Analysis</h3>
        <div className="space-y-2">
          {token_values
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 15)
            .map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span 
                    className="px-2 py-1 rounded text-sm font-medium"
                    style={{
                      backgroundColor: getColor(item.value),
                      color: getTextColor(item.value)
                    }}
                  >
                    {item.token}
                  </span>
                  <span className="text-sm text-gray-600">
                    {item.value > 0 ? '+' : ''}{item.value.toFixed(4)}
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

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Understanding the Text Plot</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Tokens with <span className="font-semibold">blue highlighting</span> increase the probability of the predicted class</li>
          <li>• Tokens with <span className="font-semibold">red highlighting</span> decrease the probability of the predicted class</li>
          <li>• Color intensity represents the magnitude of the contribution</li>
          <li>• Hover over tokens to see exact SHAP values</li>
          <li>• This helps identify which words or phrases most influenced the model's decision</li>
        </ul>
      </div>
    </div>
  );
};

export default ShapTextPlot;
