import React, { useState } from 'react';

interface SymptomInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

const SymptomInput: React.FC<SymptomInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
    }
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="symptoms" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Enter Disease Symptoms
          </label>
          <textarea
            id="symptoms"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe your symptoms... (e.g., 'I have a fever, cough, and headache')"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            disabled={isLoading}
          />
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Symptoms'}
          </button>
          
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default SymptomInput;
