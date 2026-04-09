import express from "express";
import { createServer as createViteServer, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const mode = process.env.NODE_ENV || "development";
  const env = loadEnv(mode, process.cwd(), "");

  // API routes
  app.get("/api/features", (req, res) => {
    res.json({
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
    });
  });

  app.post("/api/predict", express.json(), (req, res) => {
    const data = req.body;
    
    // Heuristic-based prediction logic (simulating the XGBoost model)
    // In a real scenario, we would load the .pkl model here if we had python.
    let riskScore = 0;
    
    if (data.rolling_7d_sum > 150) riskScore += 0.4;
    if (data.rolling_3d_sum > 80) riskScore += 0.3;
    if (data.extreme_flag) riskScore += 0.5;
    if (data.very_heavy_flag) riskScore += 0.3;
    if (data.z_score > 2) riskScore += 0.2;
    if (data.is_monsoon) riskScore += 0.1;
    
    // Normalize to 0-1
    const probability = Math.min(Math.max(riskScore, 0.05), 0.98);
    
    res.json({
      probability,
      risk_level: probability > 0.7 ? "High" : probability > 0.4 ? "Moderate" : "Low",
      timestamp: new Date().toISOString(),
      factors: {
        rainfall_intensity: data.rolling_7d_sum > 100 ? "High" : "Normal",
        soil_saturation: data.rolling_14d_sum > 200 ? "Saturated" : "Moderate",
        seasonal_risk: data.is_monsoon ? "Elevated" : "Low"
      }
    });
  });

  app.get("/api/historical", (req, res) => {
    // Mock historical data for charts
    const data = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rainfall: Math.floor(Math.random() * 100),
      risk: Math.random() * 0.8
    }));
    res.json(data);
  });

  app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from the Express backend!" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: process.cwd(),
      configFile: false,
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(process.cwd(), '.'),
        },
      },
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
