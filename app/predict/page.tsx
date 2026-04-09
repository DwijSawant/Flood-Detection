"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion } from "motion/react";
import { ShieldAlert, Droplets, Wind, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { getFeatures, predictFlood, Feature, PredictionResult } from "../../services/api";

export default function PredictPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    getFeatures().then((data) => {
      setFeatures(data.features);
      const initialData: Record<string, any> = {};
      data.features.forEach((f: Feature) => {
        initialData[f.name] = f.default;
      });
      setFormData(initialData);
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await predictFlood(formData);
      setResult(data);
    } catch (error) {
      console.error("Prediction failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    const initialData: Record<string, any> = {};
    features.forEach((f) => {
      initialData[f.name] = f.default;
    });
    setFormData(initialData);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-mono p-4 lg:p-8">
      <header className="mb-12 border-b border-[#141414] pb-8">
        <h1 className="text-3xl font-bold tracking-tighter flex items-center gap-3">
          <ShieldAlert className="w-8 h-8" />
          DISASTER_DETECT_V2.1
        </h1>
        <p className="text-xs opacity-60 mt-2 italic uppercase tracking-widest">
          Input environmental parameters to calculate localized flood probability
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form Section */}
        <section className="border border-[#141414] bg-white p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-black rounded-full" />
              Input_Parameters
            </h2>
            <button 
              onClick={handleReset}
              className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity"
            >
              [ Reset_Form ]
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div key={feature.name} className="space-y-2">
                  <label className="text-[10px] font-bold uppercase opacity-50 block">
                    {feature.label}
                  </label>
                  {feature.type === "number" ? (
                    <input
                      type="number"
                      step="any"
                      value={formData[feature.name] ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                        handleInputChange(feature.name, val);
                      }}
                      className="w-full bg-transparent border-b border-[#141414] py-2 focus:outline-none focus:border-blue-600 transition-colors text-sm"
                    />
                  ) : (
                    <div className="flex items-center gap-4 py-2">
                      <button
                        type="button"
                        onClick={() => handleInputChange(feature.name, true)}
                        className={`px-4 py-1 text-[10px] border border-[#141414] transition-colors ${
                          formData[feature.name] === true ? "bg-black text-white" : "hover:bg-gray-100"
                        }`}
                      >
                        TRUE
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange(feature.name, false)}
                        className={`px-4 py-1 text-[10px] border border-[#141414] transition-colors ${
                          formData[feature.name] === false ? "bg-black text-white" : "hover:bg-gray-100"
                        }`}
                      >
                        FALSE
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors disabled:opacity-50 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="font-bold uppercase tracking-widest">Execute Prediction</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </section>

        {/* Results Section */}
        <section className="space-y-8">
          <div className="border border-[#141414] p-8 bg-black text-white min-h-[300px] flex flex-col justify-center relative overflow-hidden">
            {!result && !loading && (
              <div className="text-center opacity-30 italic text-sm">
                Waiting for system input...
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin opacity-50" />
                <span className="text-[10px] uppercase tracking-[0.3em] animate-pulse">Processing_Data...</span>
              </div>
            )}

            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Risk_Assessment</div>
                    <h3 className={`text-5xl font-bold tracking-tighter ${
                      result.risk_level === "High" ? "text-red-500" : 
                      result.risk_level === "Moderate" ? "text-yellow-500" : "text-green-500"
                    }`}>
                      {result.risk_level.toUpperCase()}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Probability</div>
                    <div className="text-5xl font-light tracking-tighter">
                      {(result.probability * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-8">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest opacity-50 mb-2 flex items-center gap-1">
                      <Droplets className="w-3 h-3" /> Rainfall
                    </div>
                    <div className="text-xs font-bold">{result.factors.rainfall_intensity}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest opacity-50 mb-2 flex items-center gap-1">
                      <Wind className="w-3 h-3" /> Saturation
                    </div>
                    <div className="text-xs font-bold">{result.factors.soil_saturation}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest opacity-50 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Season
                    </div>
                    <div className="text-xs font-bold">{result.factors.seasonal_risk}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Background Grid Accent */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            </div>
          </div>

          <div className="border border-[#141414] p-6 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 italic">System_Logs</h3>
            <div className="space-y-2 font-mono text-[10px] opacity-70">
              <div>[{new Date().toLocaleTimeString()}] INITIALIZING_MODEL_XGBOOST_V1</div>
              <div>[{new Date().toLocaleTimeString()}] LOADING_FEATURE_WEIGHTS...</div>
              {result && (
                <>
                  <div>[{new Date().toLocaleTimeString()}] INPUT_RECEIVED: {JSON.stringify(formData).slice(0, 50)}...</div>
                  <div>[{new Date().toLocaleTimeString()}] PREDICTION_COMPLETE: {result.risk_level} RISK</div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
