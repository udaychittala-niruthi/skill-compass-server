import { Router } from "express";
import { learningPathController } from "../../controllers/learningPath.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { accessMiddleware, requireGroup } from "../../middleware/access.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(accessMiddleware);

// Get my learning path - excludes KIDS (they don't have learning paths)
router.get(
    "/my-path",
    requireGroup("TEENS", "COLLEGE_STUDENTS", "PROFESSIONALS", "SENIORS"),
    learningPathController.getMyLearningPath
);

// Get generation status - excludes KIDS
router.get(
    "/status",
    requireGroup("TEENS", "COLLEGE_STUDENTS", "PROFESSIONALS", "SENIORS"),
    learningPathController.getGenerationStatus
);

// Get modules for a path - excludes KIDS
router.get(
    "/:id/modules",
    requireGroup("TEENS", "COLLEGE_STUDENTS", "PROFESSIONALS", "SENIORS"),
    learningPathController.getPathModules
);

// Regenerate learning path - excludes KIDS
router.post(
    "/regenerate",
    requireGroup("TEENS", "COLLEGE_STUDENTS", "PROFESSIONALS", "SENIORS"),
    learningPathController.regeneratePath
);

export default router;
