import Joi from "joi";

// Prediction Validation Schemas
export const predictCourseSchema = Joi.object({
    interestIds: Joi.array().items(Joi.number()).min(1).required().messages({
        "array.base": "interestIds must be an array",
        "array.min": "At least one interest is required",
        "any.required": "interestIds is required"
    }),
    skillIds: Joi.array().items(Joi.number()).min(1).required().messages({
        "array.base": "skillIds must be an array",
        "array.min": "At least one skill is required",
        "any.required": "skillIds is required"
    })
});

export const predictBranchSchema = Joi.object({
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
    courseId: Joi.number().required().messages({
        "number.base": "courseId must be a number",
        "any.required": "courseId is required"
    })
});
