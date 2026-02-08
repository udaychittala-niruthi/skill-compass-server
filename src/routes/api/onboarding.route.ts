import { Router } from "express";
import { onboardingController } from "../../controllers/onboarding.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireGroup } from "../../middleware/access.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
    onboardKidSchema,
    onboardTeenSchema,
    onboardStudentSchema,
    onboardProfessionalSchema,
    onboardSeniorSchema,
    updateSkillsInterestsSchema
} from "../../validations/onboarding.validation.js";
import { ageUpdateSchema } from "../../validations/auth.validation.js";

const router = Router();

// all routes require authentication
router.use(authenticate);

router.get("/status", onboardingController.checkStatus);
router.put("/age", validate(ageUpdateSchema), onboardingController.updateAge);

// Skills and Interests - Accessible after age is set
router.put("/skills-interests", validate(updateSkillsInterestsSchema), onboardingController.updateSkillsAndInterests);
router.get("/skills-interests", onboardingController.getUserSkillsAndInterests);

router.post("/kids/profile", requireGroup("KIDS"), validate(onboardKidSchema), onboardingController.onboardKid);
router.post("/teens/interests", requireGroup("TEENS"), validate(onboardTeenSchema), onboardingController.onboardTeen);
router.post(
    "/students/details",
    requireGroup("COLLEGE_STUDENTS"),
    validate(onboardStudentSchema),
    onboardingController.onboardStudent
);
router.post(
    "/professionals/details",
    requireGroup("PROFESSIONALS"),
    validate(onboardProfessionalSchema),
    onboardingController.onboardProfessional
);
router.post(
    "/seniors/details",
    requireGroup("SENIORS"),
    validate(onboardSeniorSchema),
    onboardingController.onboardSenior
);

export default router;
