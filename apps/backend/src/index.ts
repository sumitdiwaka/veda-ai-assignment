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

  // WebSocket
  createWSServer(httpServer);

  // Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    })
  );
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "VedaAI Backend",
    });
  });

  // API Routes
  app.use("/api/assignments", assignmentRoutes);
  app.use("/api/papers", paperRoutes);

  // 404
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: "Route not found" });
  });

  // Error handler
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