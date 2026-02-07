import Joi from "joi";

// Kids Onboarding
export const onboardKidSchema = Joi.object({
    avatar: Joi.string().optional().messages({
        "string.base": "avatar must be a string"
    }),
    bio: Joi.string().optional().messages({
        "string.base": "bio must be a string"
    })
});

// Teens Onboarding
export const onboardTeenSchema = Joi.object({
    interestIds: Joi.array().items(Joi.number()).min(1).required().messages({
        "array.base": "interestIds must be an array",
        "array.min": "At least one interest is required",
        "any.required": "interestIds is required"
    }),
    skillIds: Joi.array().items(Joi.number()).min(1).required().messages({
        "array.base": "skillIds must be an array",
        "array.min": "At least one skill is required",
        "any.required": "skillIds is required"
    }),
    bio: Joi.string().optional().messages({
        "string.base": "bio must be a string"
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
    skills: Joi.array().items(Joi.number()).optional().messages({
        "array.base": "skills must be an array"
    }),
    bio: Joi.string().optional().messages({
        "string.base": "bio must be a string"
    })
});

// Professionals Onboarding
export const onboardProfessionalSchema = Joi.object({
    currentRole: Joi.string().required().messages({
        "string.empty": "currentRole is required",
        "any.required": "currentRole is required"
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
    skills: Joi.array().items(Joi.number()).optional().messages({
        "array.base": "skills must be an array"
    }),
    bio: Joi.string().optional().messages({
        "string.base": "bio must be a string"
    })
});

// Seniors Onboarding
export const onboardSeniorSchema = Joi.object({
    interestIds: Joi.array().items(Joi.number()).min(1).required().messages({
        "array.base": "interestIds must be an array",
        "array.min": "At least one interest is required",
        "any.required": "interestIds is required"
    }),
    bio: Joi.string().optional().messages({
        "string.base": "bio must be a string"
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
