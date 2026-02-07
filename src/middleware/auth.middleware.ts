import type { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/customResponse.js";
import jwt from "jsonwebtoken";

import { User } from "../models";

function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ");
        if (token[0] === "Bearer" && token[1]) {
            jwt.verify(token[1], process.env.JWT_SECRET || "my_jwt_scret", async (err: any, decoded: any) => {
                if (err) {
                    return sendResponse(res, false, "Unauthorized", 401);
                } else {
                    try {
                        const user = await User.findByPk(decoded.id, {
                            include: ["preferences", "certifications"]
                        });
                        if (!user) {
                            return sendResponse(res, false, "Unauthorized: User not found", 401);
                        }
                        req.user = user.toJSON();

                        // Check if age is present for non-onboarding/age routes
                        // Check if age is present for non-onboarding/age routes
                        const userObj = req.user as any;
                        if (!userObj.age && !req.originalUrl.includes("/onboarding/age")) {
                            return sendResponse(res, false, "Action failed: Age is required to proceed", 403);
                        }

                        next();
                    } catch (dbError) {
                        console.error("Auth Middleware DB Error:", dbError);
                        return sendResponse(res, false, "Internal Server Error", 500);
                    }
                }
            });
        } else {
            sendResponse(res, false, "Unauthorized", 401);
        }
    } else {
        sendResponse(res, false, "Unauthorized", 401);
    }
}

export { authenticate };
