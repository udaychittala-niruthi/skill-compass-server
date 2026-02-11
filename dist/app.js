import express from "express";
import { AppConfig } from "./config/app.config.js";
import routes from "./routes/app.routes.js";
import { sendResponse } from "./utils/customResponse.js";
import { globalErrorHandler } from "./middleware/errLogger.js";
const app = AppConfig(express());
app.get("/", (req, res) => {
    sendResponse(res, true, "👋 Hello from Server...");
});
app.get("/health", async (req, res) => {
    try {
        const sequelize = (await import("./config/db.js")).default;
        await sequelize.authenticate();
        res.status(200).send("ok");
    }
    catch (error) {
        res.status(500).send("db down");
    }
});
app.use("/api", routes);
// Global error handler (must be last)
app.use(globalErrorHandler);
export default app;
