import { LearningSchedule } from "../models/index.js";
import { sendResponse } from "../utils/customResponse.js";
export const learningScheduleController = {
    /**
     * Get learning schedule for authenticated user (requires authentication)
     */
    async getMySchedule(req, res) {
        try {
            const userId = req.user.id;
            const schedules = await LearningSchedule.findAll({
                where: { userId },
                order: [["periodNumber", "ASC"]]
            });
            return sendResponse(res, true, "Learning schedule retrieved successfully", 200, schedules);
        }
        catch (error) {
            console.error("Get Schedule Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },
    /**
     * Update schedule status (requires authentication + user owns the schedule)
     */
    async updateScheduleStatus(req, res) {
        try {
            const userId = req.user.id;
            const scheduleId = parseInt(String(req.params.id));
            if (isNaN(scheduleId)) {
                return sendResponse(res, false, "Invalid schedule ID", 400);
            }
            const { status, completionPercentage } = req.body;
            // Validate status
            const validStatuses = ["upcoming", "active", "completed", "skipped"];
            if (status && !validStatuses.includes(status)) {
                return sendResponse(res, false, `Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
            }
            const schedule = await LearningSchedule.findByPk(scheduleId);
            if (!schedule) {
                return sendResponse(res, false, "Schedule not found", 404);
            }
            if (schedule.userId !== userId) {
                return sendResponse(res, false, "Access denied: This schedule does not belong to you", 403);
            }
            await schedule.update({
                status: status || schedule.status,
                completionPercentage: completionPercentage !== undefined ? completionPercentage : schedule.completionPercentage
            });
            return sendResponse(res, true, "Schedule updated successfully", 200, schedule);
        }
        catch (error) {
            console.error("Update Schedule Status Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    }
};
