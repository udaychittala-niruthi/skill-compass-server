import { Request, Response } from "express";
import { Interest, Skill, Course, Branches } from "../models/index.js";
import { predictionService } from "../services/prediction.service.js";
import { sendResponse } from "../utils/customResponse.js";

export const commonController = {
    async getInterests(req: Request, res: Response) {
        try {
            const interests = await Interest.findAll();
            return sendResponse(res, true, "Interests fetched successfully", 200, interests);
        } catch (error: any) {
            return sendResponse(res, false, error.message, 500);
        }
    },

    async getSkills(req: Request, res: Response) {
        try {
            const skills = await Skill.findAll();
            return sendResponse(res, true, "Skills fetched successfully", 200, skills);
        } catch (error: any) {
            return sendResponse(res, false, error.message, 500);
        }
    },

    async getCourses(req: Request, res: Response) {
        try {
            const courses = await Course.findAll();
            return sendResponse(res, true, "Courses fetched successfully", 200, courses);
        } catch (error: any) {
            return sendResponse(res, false, error.message, 500);
        }
    },

    async getBranches(req: Request, res: Response) {
        try {
            const { courseId } = req.params;
            const branches = await Branches.findAll({ where: { courseId } });
            return sendResponse(res, true, "Branches fetched successfully", 200, branches);
        } catch (error: any) {
            return sendResponse(res, false, error.message, 500);
        }
    }
};

export const predictionController = {
    async predictCourse(req: Request, res: Response) {
        try {
            // Validation handled by Joi middleware
            const { interestIds, skillIds } = req.body;
            const result = await predictionService.predictCourses({ interestIds, skillIds });
            return sendResponse(res, true, "Course predictions generated", 200, result);
        } catch (error: any) {
            return sendResponse(res, false, error.message, 500);
        }
    },

    async predictBranch(req: Request, res: Response) {
        try {
            // Validation handled by Joi middleware
            const { interestIds, skillIds, courseId } = req.body;
            const result = await predictionService.predictBranches({ interestIds, skillIds, courseId });
            return sendResponse(res, true, "Branch predictions generated", 200, result);
        } catch (error: any) {
            return sendResponse(res, false, error.message, 500);
        }
    }
};
