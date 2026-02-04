import { Router } from "express";
import { onboardingController } from "../../controllers/onboarding.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireGroup } from "../../middleware/access.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
    onboardKidSchema,
    onboardTeenSchema,
    onboardStudentSchema,
    onboardProfessionalSchema,
    onboardSeniorSchema
} from "../../validations/onboarding.validation";

const router = Router();

// all routes require authentication
router.use(authenticate);

router.get("/status", onboardingController.checkStatus);

router.post("/kids/profile", requireGroup('KIDS'), validate(onboardKidSchema), onboardingController.onboardKid);
router.post("/teens/interests", requireGroup('TEENS'), validate(onboardTeenSchema), onboardingController.onboardTeen);
router.post("/students/details", requireGroup('COLLEGE_STUDENTS'), validate(onboardStudentSchema), onboardingController.onboardStudent);
router.post("/professionals/details", requireGroup('PROFESSIONALS'), validate(onboardProfessionalSchema), onboardingController.onboardProfessional);
router.post("/seniors/details", requireGroup('SENIORS'), validate(onboardSeniorSchema), onboardingController.onboardSenior);


export default router;

