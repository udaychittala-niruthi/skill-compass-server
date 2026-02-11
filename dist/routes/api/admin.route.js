import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { adminController } from "../../controllers/admin.controller.js";
import { sendResponse } from "../../utils/customResponse.js";
const router = Router();
// Middleware to ensure user is an ADMIN
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "ADMIN") {
        next();
    }
    else {
        return sendResponse(res, false, "Access denied: Admin only", 403);
    }
};
router.use(authenticate);
router.use(isAdmin);
// Course Management
router.post("/courses/sync", adminController.syncCourses);
export default router;
