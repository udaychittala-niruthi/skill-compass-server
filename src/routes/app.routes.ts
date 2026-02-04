import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import userRoutes from "./api/users.route.js";
import clipRoutes from "./api/clip.route.js";
import authRoutes from "./api/auth.route.js";
import { sendResponse } from "../utils/customResponse.js";

const routes = Router();

routes.get("/", (re: Request, res: Response) => {
  sendResponse(res, true, "😎 Api is Working..");
});

routes.use("/users", userRoutes);
routes.use("/auth", authRoutes);
routes.use("/clip", clipRoutes);

routes.use((req: Request, res: Response, next: NextFunction) => {
  sendResponse(res, false, `${req.url} is not found`, 404);
});
export default routes;
