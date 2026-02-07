import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { adminController } from "../../controllers/admin.controller";
import { sendResponse } from "../../utils/customResponse";

const router = Router();

// Middleware to ensure user is an ADMIN
const isAdmin = (req: any, res: any, next: any) => {
    if (req.user && req.user.role === "ADMIN") {
        next();
    } else {
        return sendResponse(res, false, "Access denied: Admin only", 403);
    }
};

router.use(authenticate);
router.use(isAdmin);

// Course Management
router.post("/courses/sync", adminController.syncCourses);

export default router;
