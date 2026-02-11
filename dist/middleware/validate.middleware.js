import { sendResponse } from "../utils/customResponse.js";
export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body || {}, {
            abortEarly: false
        });
        if (error) {
            return sendResponse(res, false, "Validation Error", 400, null, error.details?.map((detail) => detail.message).join(", ") || "Invalid request data");
        }
        req.body = value;
        return next();
    };
};
