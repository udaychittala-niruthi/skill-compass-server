import express from "express";
import type { Application } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import { errorLogger } from "../middleware/errLogger.js";

export function AppConfig(app: Application) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use(cors());
  app.use(helmet());
  app.use(errorLogger);

  return app;
}
