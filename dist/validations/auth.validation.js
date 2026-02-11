import Joi from "joi";
export const registerSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "Name is required"
    }),
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Invalid email format"
    }),
    password: Joi.string().min(6).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters long"
    }),
    age: Joi.number().optional().allow(null),
    dob: Joi.date().iso().optional().messages({
        "date.format": "Invalid date format, use ISO string (YYYY-MM-DD)"
    })
});
export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Invalid email format"
    }),
    password: Joi.string().required().messages({
        "string.empty": "Password is required"
    })
});
export const ageUpdateSchema = Joi.object({
    age: Joi.number().required().min(5).max(100).messages({
        "number.base": "Age must be a number",
        "number.min": "Age must be at least 5",
        "number.max": "Age must be at most 100",
        "any.required": "Age is required"
    })
});
