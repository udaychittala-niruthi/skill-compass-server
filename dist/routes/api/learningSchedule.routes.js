import { Router } from "express";
import { learningScheduleController } from "../../controllers/learningSchedule.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { accessMiddleware } from "../../middleware/access.middleware.js";
const router = Router();
// All routes require authentication
router.use(authenticate);
router.use(accessMiddleware);
// Get my learning schedule
router.get("/my-schedule", learningScheduleController.getMySchedule);
// Update schedule status
router.put("/:id/status", learningScheduleController.updateScheduleStatus);
export default router;
