import { Router } from "express";
import userController from "../../controllers/users.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
const userRoutes = Router();

userRoutes.use(authenticate);
userRoutes.get("/", userController.getUsers);
userRoutes.post("/", userController.createUser);

export default userRoutes;
