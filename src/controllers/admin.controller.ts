import { Request, Response } from "express";
import { aiGenerateService } from "../services/aiGenerate.service.js";
import { sendResponse } from "../utils/customResponse.js";

class AdminController {
    /**
     * POST /api/admin/courses/sync
     * Syncs courses with AI enrichment and generation.
     */
    async syncCourses(req: Request, res: Response) {
        try {
            const { inputCourses, generateCount } = req.body;

            if (!Array.isArray(inputCourses)) {
                return sendResponse(res, false, "inputCourses must be an array", 400);
            }

            const results = await aiGenerateService.syncCourses(inputCourses, generateCount || 0);

            return sendResponse(res, true, "Courses synchronized successfully", 200, results);
        } catch (error: any) {
            console.error("Admin Course Sync Error:", error);
            return sendResponse(res, false, `Failed to sync courses: ${error.message}`, 500);
        }
    }
}

export const adminController = new AdminController();
