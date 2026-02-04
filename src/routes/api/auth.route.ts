import { Router } from "express";
import authController from "../../controllers/auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  loginSchema,
  registerSchema,
} from "../../validations/auth.validation.js";

const authRoutes = Router();

authRoutes.post("/login", validate(loginSchema), authController.login);
authRoutes.post("/register", validate(registerSchema), authController.register);

export default authRoutes;
