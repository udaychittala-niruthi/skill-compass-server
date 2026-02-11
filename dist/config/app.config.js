import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import { errorLoggerMiddleware } from "../middleware/errLogger.js";
export function AppConfig(app) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan("dev"));
    app.use(cors({
        origin: "*",
        credentials: true
    }));
    app.use(helmet());
    app.use(errorLoggerMiddleware);
    return app;
}
