import Joi from "joi";

// Kids Onboarding
export const onboardKidSchema = Joi.object({
    learningStyle: Joi.string().required().messages({
        "string.empty": "Learning style is required",
        "any.required": "Learning style is required"
    }),
    weeklyLearningHours: Joi.number().min(0).required().messages({
        "number.base": "Weekly learning hours must be a number",
        "any.required": "Weekly learning hours is required"
    }),
    avatar: Joi.string().optional().messages({
        "string.base": "avatar must be a string"
    })
});

// Teens Onboarding
export const onboardTeenSchema = Joi.object({
    learningStyle: Joi.string().required().messages({
        "string.empty": "Learning style is required",
        "any.required": "Learning style is required"
    }),
    weeklyLearningHours: Joi.number().min(0).required().messages({
        "number.base": "Weekly learning hours must be a number",
        "any.required": "Weekly learning hours is required"
    }),
    courseId: Joi.number().optional().messages({
        "number.base": "courseId must be a number"
    }),
    branchId: Joi.number().optional().messages({
        "number.base": "branchId must be a number"
    }),
    interestIds: Joi.array().items(Joi.number()).optional().messages({
        "array.base": "interestIds must be an array"
    }),
    skillIds: Joi.array().items(Joi.number()).optional().messages({
        "array.base": "skillIds must be an array"
    })
});

// College Students Onboarding
export const onboardStudentSchema = Joi.object({
    courseId: Joi.number().required().messages({
        "number.base": "courseId must be a number",
        "any.required": "courseId is required"
    }),
    branchId: Joi.number().required().messages({
        "number.base": "branchId must be a number",
        "any.required": "branchId is required"
    }),
    learningStyle: Joi.string().required().messages({
        "string.empty": "Learning style is required",
        "any.required": "Learning style is required"
    }),
    weeklyLearningHours: Joi.number().min(0).required().messages({
        "number.base": "Weekly learning hours must be a number",
        "any.required": "Weekly learning hours is required"
    }),
    skillIds: Joi.array().items(Joi.number()).optional().messages({
        "array.base": "skillIds must be an array"
    })
});

// Professionals Onboarding
export const onboardProfessionalSchema = Joi.object({
    courseId: Joi.number().required().messages({
        "number.base": "courseId must be a number",
        "any.required": "courseId is required"
    }),
    branchId: Joi.number().required().messages({
        "number.base": "branchId must be a number",
        "any.required": "branchId is required"
    }),
    learningStyle: Joi.string().required().messages({
        "string.empty": "Learning style is required",
        "any.required": "Learning style is required"
    }),
    weeklyLearningHours: Joi.number().min(0).required().messages({
        "number.base": "Weekly learning hours must be a number",
        "any.required": "Weekly learning hours is required"
    }),
    currentRole: Joi.string().required().messages({
        "string.empty": "currentRole is required",
        "any.required": "currentRole is required"
    }),
    targetRole: Joi.string().required().messages({
        "string.empty": "targetRole is required",
        "any.required": "targetRole is required"
    }),
    industry: Joi.string().required().messages({
        "string.empty": "industry is required",
        "any.required": "industry is required"
    }),
    yearsOfExperience: Joi.number().min(0).required().messages({
        "number.base": "yearsOfExperience must be a number",
        "number.min": "yearsOfExperience must be at least 0",
        "any.required": "yearsOfExperience is required"
    }),
    skillIds: Joi.array().items(Joi.number()).optional().messages({
        "array.base": "skillIds must be an array"
    })
});

// Seniors Onboarding
export const onboardSeniorSchema = Joi.object({
    learningStyle: Joi.string().required().messages({
        "string.empty": "Learning style is required",
        "any.required": "Learning style is required"
    }),
    weeklyLearningHours: Joi.number().min(0).required().messages({
        "number.base": "Weekly learning hours must be a number",
        "any.required": "Weekly learning hours is required"
    }),
    courseId: Joi.number().optional().messages({
        "number.base": "courseId must be a number"
    }),
    branchId: Joi.number().optional().messages({
        "number.base": "branchId must be a number"
    }),
    interestIds: Joi.array().items(Joi.number()).optional().messages({
        "array.base": "interestIds must be an array"
    }),
    skillIds: Joi.array().items(Joi.number()).optional().messages({
        "array.base": "skillIds must be an array"
    }),
    accessibilitySettings: Joi.object().optional().messages({
        "object.base": "accessibilitySettings must be an object"
    })
});

// Update Skills and Interests
export const updateSkillsInterestsSchema = Joi.object({
    skillIds: Joi.array().items(Joi.number()).unique().optional().messages({
        "array.base": "skillIds must be an array"
    }),
    interestIds: Joi.array().items(Joi.number()).unique().optional().messages({
        "array.base": "interestIds must be an array"
    })
}).custom((value, helpers) => {
    const hasSkills = value.skillIds && value.skillIds.length > 0;
    const hasInterests = value.interestIds && value.interestIds.length > 0;

    if (!hasSkills && !hasInterests) {
        return helpers.message({ custom: "At least one skill or interest must be selected" });
    }
    return value;
});
