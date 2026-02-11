import { User } from "../models/index.js";
import { sendResponse } from "../utils/customResponse.js";
const userController = {
    async getUsers(req, res) {
        try {
            const data = await User.findAll();
            return sendResponse(res, true, "Users fetched successfully", 200, data);
        }
        catch (err) {
            console.error("❌ Error in fetching Users Data: ", err);
            return sendResponse(res, false, "Internal server error", 500);
        }
    },
    async createUser(req, res) {
        return sendResponse(res, false, "Use /auth/register to create users", 501);
    },
    async updateProfile(req, res) {
        try {
            const user = req.user;
            const { allowedUpdateFields } = req.serviceAccess || {};
            if (!user) {
                return sendResponse(res, false, "User not found", 404);
            }
            // Filter body to only allowed fields
            const updates = {};
            const requestedUpdates = Object.keys(req.body);
            if (!allowedUpdateFields || allowedUpdateFields.length === 0) {
                return sendResponse(res, false, "You do not have permission to update any fields.", 403);
            }
            requestedUpdates.forEach((field) => {
                if (allowedUpdateFields.includes(field)) {
                    updates[field] = req.body[field];
                }
            });
            if (Object.keys(updates).length === 0) {
                return sendResponse(res, false, "No valid fields to update found or permission denied for requested fields.", 400);
            }
            await User.update(updates, { where: { id: user.id } });
            const updatedUser = await User.findByPk(user.id);
            return sendResponse(res, true, "Profile updated successfully", 200, updatedUser);
        }
        catch (err) {
            console.error("❌ Error updating profile: ", err);
            return sendResponse(res, false, "Internal server error", 500);
        }
    }
};
export default userController;
