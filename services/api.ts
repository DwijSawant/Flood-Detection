// Mock API service for client-side execution
// This replaces the Express backend to allow the app to run as a pure SPA.

export interface Feature {
  name: string;
  label: string;
  type: "number" | "boolean";
  default: number | boolean;
}

export interface PredictionResult {
  probability: number;
  risk_level: string;
  timestamp: string;
  factors: {
    rainfall_intensity: string;
    soil_saturation: string;
    seasonal_risk: string;
  };
}

export interface HistoricalData {
  date: string;
  rainfall: number;
  risk: number;
}

export const getFeatures = async (): Promise<{ features: Feature[] }> => {
  return {
    features: [
      { name: "rolling_7d_sum", label: "7-Day Rainfall Sum (mm)", type: "number", default: 50 },
      { name: "rolling_3d_sum", label: "3-Day Rainfall Sum (mm)", type: "number", default: 20 },
      { name: "rolling_14d_sum", label: "14-Day Rainfall Sum (mm)", type: "number", default: 100 },
      { name: "z_score", label: "Rainfall Z-Score", type: "number", default: 1.2 },
      { name: "percentile_7d", label: "7-Day Percentile", type: "number", default: 85 },
      { name: "dry_spell_streak", label: "Dry Spell Streak (days)", type: "number", default: 2 },
      { name: "extreme_flag", label: "Extreme Rainfall Event", type: "boolean", default: false },
      { name: "very_heavy_flag", label: "Very Heavy Rainfall", type: "boolean", default: false },
      { name: "heavy_flag", label: "Heavy Rainfall", type: "boolean", default: true },
      { name: "is_monsoon", label: "Monsoon Season", type: "boolean", default: true },
    ]
  };
};

export const predictFlood = async (data: Record<string, any>): Promise<PredictionResult> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Heuristic-based prediction logic (simulating the XGBoost model)
  let riskScore = 0;
  
  if (data.rolling_7d_sum > 150) riskScore += 0.4;
  if (data.rolling_3d_sum > 80) riskScore += 0.3;
  if (data.extreme_flag) riskScore += 0.5;
  if (data.very_heavy_flag) riskScore += 0.3;
  if (data.z_score > 2) riskScore += 0.2;
  if (data.is_monsoon) riskScore += 0.1;
  
  const probability = Math.min(Math.max(riskScore, 0.05), 0.98);
  
  return {
    probability,
    risk_level: probability > 0.7 ? "High" : probability > 0.4 ? "Moderate" : "Low",
    timestamp: new Date().toISOString(),
    factors: {
      rainfall_intensity: data.rolling_7d_sum > 100 ? "High" : "Normal",
      soil_saturation: data.rolling_14d_sum > 200 ? "Saturated" : "Moderate",
      seasonal_risk: data.is_monsoon ? "Elevated" : "Low"
    }
  };
};

export const getHistoricalData = async (): Promise<HistoricalData[]> => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rainfall: Math.floor(Math.random() * 100),
    risk: Math.random() * 0.8
  }));
};
