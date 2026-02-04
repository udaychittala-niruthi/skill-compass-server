import { User, sequelize } from "../models";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/customResponse.js";

const authController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({
        where: {
          email: email,
        },
      });

      if (!user) {
        return sendResponse(res, false, "Invalid email or password", 401);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return sendResponse(res, false, "Invalid email or password", 401);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "my_jwt_scret",
        { expiresIn: "10d" },
      );

      const userWithProgress = await User.findByPk(user.id, {
        include: ["userPreferences"],
      });

      // Convert to plain object to remove properties
      const userObj = userWithProgress?.toJSON() as any;
      const { password: _, ...userWithoutPassword } = userObj || {};

      return sendResponse(res, true, "Login successful", 200, {
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Login Error:", error);
      return sendResponse(res, false, "Internal Server Error", 500);
    }
  },

  async register(req: Request, res: Response) {
    try {
      const { name, email, password, dob } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return sendResponse(res, false, "User already exists", 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await sequelize.transaction(async (t) => {
        const user = await User.create(
          {
            name,
            email,
            password: hashedPassword,
          },
          { transaction: t }
        );

        return user;
      });

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET || "my_jwt_scret",
        { expiresIn: "1d" },
      );

      const userWithProgress = await User.findByPk(newUser.id, {
        include: ["userPreferences"],
      });

      const userObj = userWithProgress?.toJSON() as any;
      const { password: _, ...userWithoutPassword } = userObj || {};

      return sendResponse(res, true, "User registered successfully", 201, {
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Register error:", error);
      return sendResponse(res, false, "Internal server error", 500);
    }
  },
};

export default authController;
