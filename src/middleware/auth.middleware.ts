import type { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/customResponse.js";
import jwt from "jsonwebtoken";

function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ");
    if (token[0] === "Bearer" && token[1]) {
      jwt.verify(
        token[1],
        process.env.JWT_SECRET || "my_jwt_scret",
        (err, user) => {
          if (err) {
            sendResponse(res, false, "Unauthorized", 401);
          } else {
            req.user = user!;
            next();
          }
        }
      );
    } else {
      sendResponse(res, false, "Unauthorized", 401);
    }
  } else {
    sendResponse(res, false, "Unauthorized", 401);
  }
}

export { authenticate };
