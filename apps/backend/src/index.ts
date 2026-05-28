import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";

import { env } from "./config/env";
import { connectDB } from "./config/db";
import { createWSServer } from "./websocket/ws.server";

import assignmentRoutes from "./routes/assignment.routes";
import paperRoutes from "./routes/paper.routes";
import { errorHandler } from "./middleware/error";

async function bootstrap(): Promise<void> {
  await connectDB();

  const app = express();
  const httpServer = createServer(app);

  createWSServer(httpServer);

  app.use(helmet());
  
  // ✅ CORS — allow everything in production
  app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: false,
  }));

  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "VedaAI Backend",
      env: env.NODE_ENV,
    });
  });

  app.use("/api/assignments", assignmentRoutes);
  app.use("/api/papers", paperRoutes);

  app.use((_req, res) => {
    res.status(404).json({ success: false, error: "Route not found" });
  });

  app.use(errorHandler);

  httpServer.listen(parseInt(env.PORT), () => {
    console.log(`
🚀 VedaAI Backend running on port ${env.PORT}
📡 WebSocket at ws://localhost:${env.PORT}/ws
🌍 Environment: ${env.NODE_ENV}
    `);
  });
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});