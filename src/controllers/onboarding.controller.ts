import { Request, Response } from "express";
import { onboardingService } from "../services/onboarding.service";
import { sendResponse } from "../utils/customResponse";

export const onboardingController = {
    async onboardKid(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const data = req.body;
            const result = await onboardingService.onboardKid(userId, data);
            return sendResponse(res, true, "Kid profile updated successfully", 200, result);
        } catch (error: any) {
            console.error("Onboarding Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },

    async onboardTeen(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const data = req.body;
            const result = await onboardingService.onboardTeen(userId, data);
            return sendResponse(res, true, "Teen interests updated successfully", 200, result);
        } catch (error: any) {
            console.error("Onboarding Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },

    async onboardStudent(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const data = req.body;
            const result = await onboardingService.onboardStudent(userId, data);
            return sendResponse(res, true, "Student details updated successfully", 200, result);
        } catch (error: any) {
            console.error("Onboarding Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },

    async onboardProfessional(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const data = req.body;
            const result = await onboardingService.onboardProfessional(userId, data);
            return sendResponse(res, true, "Professional details updated successfully", 200, result);
        } catch (error: any) {
            console.error("Onboarding Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },

    async onboardSenior(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const data = req.body;
            const result = await onboardingService.onboardSenior(userId, data);
            return sendResponse(res, true, "Senior details updated successfully", 200, result);
        } catch (error: any) {
            console.error("Onboarding Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },

    async checkStatus(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const status = await onboardingService.getOnboardingStatus(userId);
            return sendResponse(res, true, "Onboarding status retrieved", 200, status);
        } catch (error: any) {
            console.error("Status Check Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },

    async updateAge(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { age } = req.body;
            const result = await onboardingService.updateAge(userId, age);
            return sendResponse(res, true, "Age updated successfully", 200, result);
        } catch (error: any) {
            console.error("Update Age Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },

    async updateSkillsAndInterests(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const data = req.body;
            const result = await onboardingService.updateSkillsAndInterests(userId, data);
            return sendResponse(res, true, "Skills and interests updated successfully", 200, result);
        } catch (error: any) {
            console.error("Update Skills/Interests Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },

    async getUserSkillsAndInterests(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const result = await onboardingService.getUserSkillsAndInterests(userId);
            return sendResponse(res, true, "User skills and interests retrieved", 200, result);
        } catch (error: any) {
            console.error("Get Skills/Interests Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    }
};
