import { Router } from "express";
import { learningProgressController } from "../../controllers/learningProgress.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { accessMiddleware } from "../../middleware/access.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(accessMiddleware);

// Get all my progress
router.get("/my-progress", learningProgressController.getMyProgress);

// Get progress for a specific module
router.get("/module/:moduleId", learningProgressController.getModuleProgress);

// Update progress for a module
router.post("/module/:moduleId", learningProgressController.updateModuleProgress);

export default router;
