import { User } from "../models";
import type { Request, Response } from "express";
import { sendResponse } from "../utils/customResponse.js";

const userController = {
  async getUsers(req: Request, res: Response) {
    try {
      const data = await User.findAll();
      return sendResponse(res, true, "Users fetched successfully", 200, data);
    } catch (err) {
      console.error("❌ Error in fetching Users Data: ", err);
      return sendResponse(res, false, "Internal server error", 500);
    }
  },
  async createUser(req: Request, res: Response) {
    return sendResponse(res, false, "Use /auth/register to create users", 501);
  },
};

export default userController;
