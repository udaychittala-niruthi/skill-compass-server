import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload | undefined;
    }
  }
  interface Response {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
  }
}
