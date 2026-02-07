import express from "express";
import type { Application, Request, Response } from "express";
import { AppConfig } from "./config/app.config.js";
import routes from "./routes/app.routes.js";
import { sendResponse } from "./utils/customResponse.js";
import { globalErrorHandler } from "./middleware/errLogger.js";

const app: Application = AppConfig(express());

app.get("/", (req: Request, res: Response) => {
    sendResponse(res, true, "👋 Hello from Server...");
});

app.use("/api", routes);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
