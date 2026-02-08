import { Router } from "express";
import { commonController, predictionController } from "../../controllers/common.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { predictCourseSchema, predictBranchSchema } from "../../validations/prediction.validation.js";

const router = Router();

// Public or Authenticated? Usually common data might be public, but let's secure it.
router.use(authenticate);

// Metadata Routes
router.get("/interests", commonController.getInterests);
router.get("/skills", commonController.getSkills);
router.get("/courses", commonController.getCourses);
router.get("/courses/:courseId/branches", commonController.getBranches);

// Prediction Routes
router.post("/predict/course", validate(predictCourseSchema), predictionController.predictCourse);
router.post("/predict/branch", validate(predictBranchSchema), predictionController.predictBranch);

export default router;
