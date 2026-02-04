import type { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { sendResponse } from "../utils/customResponse.js";

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body || {}, {
      abortEarly: false,
    });
    if (error) {
      return sendResponse(
        res,
        false,
        "Validation Error",
        400,
        null,
        error.details?.map((detail) => detail.message).join(", ") ||
          "Invalid request data",
      );
    }
    req.body = value;
    return next();
  };
};
