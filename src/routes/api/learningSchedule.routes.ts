import { Router } from "express";
import { learningScheduleController } from "../../controllers/learningSchedule.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { accessMiddleware } from "../../middleware/access.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(accessMiddleware);

// Get my learning schedule
router.get("/my-schedule", learningScheduleController.getMySchedule);

// Update schedule status
router.put("/:id/status", learningScheduleController.updateScheduleStatus);

export default router;
