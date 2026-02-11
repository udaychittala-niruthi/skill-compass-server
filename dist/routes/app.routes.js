import { Router } from "express";
import userRoutes from "./api/users.route.js";
import clipRoutes from "./api/clip.route.js";
import authRoutes from "./api/auth.route.js";
import onboardingRoutes from "./api/onboarding.route.js";
import commonRoutes from "./api/common.route.js";
import learningPathRoutes from "./api/learningPath.routes.js";
import learningProgressRoutes from "./api/learningProgress.routes.js";
import learningScheduleRoutes from "./api/learningSchedule.routes.js";
import adminRoutes from "./api/admin.route.js";
import { sendResponse } from "../utils/customResponse.js";
const routes = Router();
routes.get("/", (re, res) => {
    sendResponse(res, true, "😎 Api is Working..");
});
routes.use("/users", userRoutes);
routes.use("/auth", authRoutes);
routes.use("/clip", clipRoutes);
routes.use("/onboarding", onboardingRoutes);
routes.use("/common", commonRoutes);
routes.use("/learning-path", learningPathRoutes);
routes.use("/learning-progress", learningProgressRoutes);
routes.use("/learning-schedule", learningScheduleRoutes);
routes.use("/admin", adminRoutes);
routes.use((err, req, res, _next) => {
    sendResponse(res, false, `${req.url} is not found`, 404);
});
export default routes;
