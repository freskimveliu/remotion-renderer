import "dotenv/config";
import express from "express";
import path from "path";

import { apiKeyAuth } from "./middleware/auth";
import renderRoutes from "./routes/render";
import screenshotRoutes from "./routes/screenshot";
import templateRoutes from "./routes/templates";
import exampleRoutes from "./routes/example";

const app = express();
const port = parseInt(process.env.PORT || "3100", 10);

// CORS — allow all origins for local development
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
  if (_req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

// Body parsing
app.use(express.json({ limit: "10mb" }));

// Serve rendered videos as static files
const outputDir = path.resolve(process.env.OUTPUT_DIR || "./public/output");
app.use("/output", express.static(outputDir));

// API key auth — only enabled when API_KEY is set in .env
if (process.env.API_KEY) {
  app.use("/api", apiKeyAuth);
}

// Routes
app.use("/api/render", renderRoutes);
app.use("/api/screenshot", screenshotRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/examples", exampleRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Remotion Renderer API running on http://localhost:${port}`);
  console.log(`  POST /api/render        — Queue a render job`);
  console.log(`  GET  /api/render/:jobId  — Check render status`);
  console.log(`  POST /api/render/:jobId/cancel — Cancel a render`);
  console.log(`  GET  /api/templates      — List available templates`);
  console.log(`  POST /api/screenshot      — Screenshot HTML to image`);
  console.log(`  GET  /api/examples       — Example API calls`);
  console.log(`  GET  /health             — Health check`);
});
