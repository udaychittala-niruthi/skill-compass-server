import { learningPathService } from "../services/learningPath.service.js";
import { sendResponse } from "../utils/customResponse.js";
export const learningPathController = {
    /**
     * Get authenticated user's learning path (requires authentication)
     */
    async getMyLearningPath(req, res) {
        try {
            const userId = req.user.id;
            const learningPath = await learningPathService.getLearningPathByUserId(userId);
            if (!learningPath) {
                return sendResponse(res, false, "No learning path found", 404);
            }
            return sendResponse(res, true, "Learning path retrieved successfully", 200, learningPath);
        }
        catch (error) {
            console.error("Get Learning Path Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },
    /**
     * Get generation status for authenticated user (requires authentication)
     */
    async getGenerationStatus(req, res) {
        try {
            const userId = req.user.id;
            const status = await learningPathService.getGenerationStatus(userId);
            return sendResponse(res, true, "Generation status retrieved successfully", 200, status);
        }
        catch (error) {
            console.error("Get Generation Status Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },
    /**
     * Get modules for a learning path (requires authentication + user owns the path)
     */
    async getPathModules(req, res) {
        try {
            const userId = req.user.id;
            const learningPath = await learningPathService.getLearningPathByUserId(userId);
            if (!learningPath) {
                return sendResponse(res, false, "No learning path found", 404);
            }
            return sendResponse(res, true, "Modules retrieved successfully", 200, {
                modules: learningPath.modules
            });
        }
        catch (error) {
            console.error("Get Path Modules Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },
    async getPathModule(req, res) {
        try {
            const userId = req.user.id;
            const moduleId = req.params.moduleId;
            const learningPath = await learningPathService.getLearningPathByUserId(userId);
            if (!learningPath) {
                return sendResponse(res, false, "No learning path found", 404);
            }
            const module = learningPath.modules.find((m) => m.id === Number(moduleId));
            if (!module) {
                return sendResponse(res, false, "Module not found", 404);
            }
            return sendResponse(res, true, "Module retrieved successfully", 200, module);
        }
        catch (error) {
            console.error("Get Path Module Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },
    /**
     * Regenerate learning path (requires authentication)
     * Only allowed if previous generation is completed or failed
     */
    async regeneratePath(req, res) {
        try {
            const userId = req.user.id;
            const status = await learningPathService.getGenerationStatus(userId);
            if (status.exists && status.status === "generating") {
                return sendResponse(res, false, "Learning path generation is already in progress", 400);
            }
            // Trigger regeneration
            await learningPathService.generateLearningPath(userId);
            return sendResponse(res, true, "Learning path regeneration started", 200, {
                status: "generating",
                message: "Your learning path is being regenerated. You will be notified when it's ready."
            });
        }
        catch (error) {
            console.error("Regenerate Path Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    }
};
