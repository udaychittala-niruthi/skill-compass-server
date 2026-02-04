import { Router } from "express";
import { onboardingController } from "../../controllers/onboarding.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// all routes require authentication
router.use(authenticate);

router.post("/kids/profile", onboardingController.onboardKid);
router.post("/teens/interests", onboardingController.onboardTeen);
router.post("/students/details", onboardingController.onboardStudent);
router.post("/students/predict", onboardingController.predictStudentCourse);
router.post("/professionals/details", onboardingController.onboardProfessional);
router.post("/seniors/details", onboardingController.onboardSenior);
router.get("/status", onboardingController.checkStatus);

export default router;
