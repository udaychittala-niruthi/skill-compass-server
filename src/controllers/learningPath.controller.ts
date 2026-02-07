import { Request, Response } from "express";
import { learningPathService } from "../services/learningPath.service";
import { sendResponse } from "../utils/customResponse";

export const learningPathController = {
    /**
     * Get authenticated user's learning path (requires authentication)
     */
    async getMyLearningPath(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;

            const learningPath = await learningPathService.getLearningPathByUserId(userId);

            if (!learningPath) {
                return sendResponse(res, false, "No learning path found", 404);
            }

            return sendResponse(res, true, "Learning path retrieved successfully", 200, learningPath);
        } catch (error: any) {
            console.error("Get Learning Path Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },

    /**
     * Get generation status for authenticated user (requires authentication)
     */
    async getGenerationStatus(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;

            const status = await learningPathService.getGenerationStatus(userId);

            return sendResponse(res, true, "Generation status retrieved successfully", 200, status);
        } catch (error: any) {
            console.error("Get Generation Status Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },

    /**
     * Get modules for a learning path (requires authentication + user owns the path)
     */
    async getPathModules(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const pathIdParam = req.params.id;
            const pathId = parseInt(Array.isArray(pathIdParam) ? pathIdParam[0] : pathIdParam);

            if (isNaN(pathId)) {
                return sendResponse(res, false, "Invalid path ID", 400);
            }

            const learningPath = await learningPathService.getLearningPathByUserId(userId);

            if (!learningPath) {
                return sendResponse(res, false, "Learning path not found", 404);
            }

            if (learningPath.id !== pathId) {
                return sendResponse(res, false, "Access denied: This path does not belong to you", 403);
            }

            return sendResponse(res, true, "Modules retrieved successfully", 200, {
                modules: learningPath.path
            });
        } catch (error: any) {
            console.error("Get Path Modules Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },

    /**
     * Regenerate learning path (requires authentication)
     * Only allowed if previous generation is completed or failed
     */
    async regeneratePath(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;

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
        } catch (error: any) {
            console.error("Regenerate Path Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    }
};
