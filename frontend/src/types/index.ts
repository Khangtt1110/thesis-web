export interface PredictionRequest {
  text: string;
}

export interface PredictionResponse {
  label: string;
  confidence: number;
  class_probabilities: Record<string, number>;
}

export interface ShapTokenValue {
  token: string;
  value: number;
  importance: number;
  position?: number;
}

export interface ShapFeatureValue {
  feature: string;
  value: number;
  importance: number;
}

export interface ShapTextPlotData {
  token_values: ShapTokenValue[];
  base_value: number;
  prediction: string;
  text: string;
}

export interface ShapPlotData {
  plot_base64: string;
  plot_type: string;
  prediction: string;
  text: string;
}

export interface ShapResponse {
  token_values?: ShapTokenValue[];
  feature_values?: ShapFeatureValue[];
  text_plot_data?: ShapTextPlotData;
  shap_plot?: ShapPlotData;
  base_value: number;
  prediction: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
