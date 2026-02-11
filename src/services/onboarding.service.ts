import { User, UserPreferences } from "../models/index.js";
import { learningPathService } from "./learningPath.service.js";
import { Op } from "sequelize";
import { Skill, Interest } from "../models/index.js";

class OnboardingService {
    async onboardKid(userId: number, data: { learningStyle: string; weeklyLearningHours: number; avatar?: string }) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        let prefs = await UserPreferences.findOne({ where: { userId } });
        if (!prefs) {
            prefs = await UserPreferences.create({ userId, ...data });
        } else {
            await prefs.update(data);
        }

        await user.update({ isOnboarded: true });

        // KIDS don't get learning paths - they only use clip module
        console.log(`Onboarding complete for KIDS user ${userId} - skipping learning path generation`);

        return prefs;
    }

    async onboardTeen(
        userId: number,
        data: {
            learningStyle: string;
            weeklyLearningHours: number;
            interestIds?: number[];
            skillIds?: number[];
            courseId?: number;
            branchId?: number;
        }
    ) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        // Prepare data for preferences
        const prefsData: any = {
            learningStyle: data.learningStyle,
            weeklyLearningHours: data.weeklyLearningHours,
            interestIds: data.interestIds || [],
            skillIds: data.skillIds || []
        };

        // Only add courseId/branchId when they are valid positive IDs; 0 would violate FK
        if (data.courseId !== undefined) prefsData.courseId = data.courseId > 0 ? data.courseId : null;
        if (data.branchId !== undefined) prefsData.branchId = data.branchId > 0 ? data.branchId : null;

        let prefs = await UserPreferences.findOne({ where: { userId } });
        if (!prefs) {
            prefs = await UserPreferences.create({ userId, ...prefsData });
        } else {
            await prefs.update(prefsData);
        }

        await user.update({ isOnboarded: true });

        // Trigger learning path generation (async - don't wait)
        learningPathService.generateLearningPath(userId).catch((err) => {
            console.error(`Failed to initiate learning path generation for user ${userId}:`, err);
        });

        return prefs;
    }

    async onboardStudent(
        userId: number,
        data: {
            courseId: number;
            branchId: number;
            learningStyle: string;
            weeklyLearningHours: number;
            skillIds?: number[];
        }
    ) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        if (!data.courseId || !data.branchId || !data.learningStyle || data.weeklyLearningHours === undefined) {
            throw new Error("Course, branch, learning style, and weekly learning hours are required");
        }

        let prefs = await UserPreferences.findOne({ where: { userId } });
        if (!prefs) {
            prefs = await UserPreferences.create({
                userId,
                courseId: data.courseId,
                branchId: data.branchId,
                learningStyle: data.learningStyle,
                weeklyLearningHours: data.weeklyLearningHours,
                skillIds: data.skillIds || []
            });
        } else {
            await prefs.update({
                courseId: data.courseId,
                branchId: data.branchId,
                learningStyle: data.learningStyle,
                weeklyLearningHours: data.weeklyLearningHours,
                skillIds: data.skillIds || []
            });
        }

        await user.update({ isOnboarded: true });

        // Trigger learning path generation (async - don't wait)
        learningPathService.generateLearningPath(userId).catch((err) => {
            console.error(`Failed to initiate learning path generation for user ${userId}:`, err);
        });

        return prefs;
    }

    async onboardProfessional(
        userId: number,
        data: {
            courseId: number;
            branchId: number;
            learningStyle: string;
            weeklyLearningHours: number;
            currentRole: string;
            targetRole: string;
            industry: string;
            yearsOfExperience: number;
            skillIds?: number[];
        }
    ) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        if (
            !data.courseId ||
            !data.branchId ||
            !data.learningStyle ||
            data.weeklyLearningHours === undefined ||
            !data.currentRole ||
            !data.targetRole ||
            !data.industry ||
            data.yearsOfExperience === undefined
        ) {
            throw new Error("Missing required professional information");
        }

        let prefs = await UserPreferences.findOne({ where: { userId } });
        const updateData = {
            courseId: data.courseId,
            branchId: data.branchId,
            learningStyle: data.learningStyle,
            weeklyLearningHours: data.weeklyLearningHours,
            currentRole: data.currentRole,
            targetRole: data.targetRole,
            industry: data.industry,
            yearsOfExperience: data.yearsOfExperience,
            skillIds: data.skillIds || []
        };

        if (!prefs) {
            prefs = await UserPreferences.create({
                userId,
                ...updateData
            });
        } else {
            await prefs.update(updateData);
        }

        await user.update({ isOnboarded: true });

        // Trigger learning path generation (async - don't wait)
        learningPathService.generateLearningPath(userId).catch((err) => {
            console.error(`Failed to initiate learning path generation for user ${userId}:`, err);
        });

        return prefs;
    }

    async onboardSenior(
        userId: number,
        data: {
            learningStyle: string;
            weeklyLearningHours: number;
            courseId?: number;
            branchId?: number;
            interestIds?: number[];
            skillIds?: number[];
            accessibilitySettings?: any;
        }
    ) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        if (!data.learningStyle || data.weeklyLearningHours === undefined) {
            throw new Error("Learning style and weekly learning hours are required");
        }

        let prefs = await UserPreferences.findOne({ where: { userId } });
        const updateData: any = {
            learningStyle: data.learningStyle,
            weeklyLearningHours: data.weeklyLearningHours,
            interestIds: data.interestIds || [],
            skillIds: data.skillIds || [],
            groupSpecificData: { accessibility: data.accessibilitySettings }
        };

        // Only set courseId/branchId when they are valid positive IDs; 0 would violate FK
        if (data.courseId !== undefined) updateData.courseId = data.courseId > 0 ? data.courseId : null;
        if (data.branchId !== undefined) updateData.branchId = data.branchId > 0 ? data.branchId : null;

        if (!prefs) {
            prefs = await UserPreferences.create({
                userId,
                ...updateData
            });
        } else {
            await prefs.update(updateData);
        }

        await user.update({ isOnboarded: true });

        // Trigger learning path generation (async - don't wait)
        learningPathService.generateLearningPath(userId).catch((err) => {
            console.error(`Failed to initiate learning path generation for user ${userId}:`, err);
        });

        return prefs;
    }

    async updateAge(userId: number, age: number) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        let group;
        if (age < 13) group = "KIDS";
        else if (age <= 17) group = "TEENS";
        else if (age <= 25) group = "COLLEGE_STUDENTS";
        else if (age <= 60) group = "PROFESSIONALS";
        else group = "SENIORS";

        await user.update({ age, group: group as any }); // Type assertion for group
        return { age, group };
    }

    async getOnboardingStatus(userId: number) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        const prefs = await UserPreferences.findOne({ where: { userId } });

        return {
            user,
            isOnboarded: user.isOnboarded,
            age: user.age,
            group: user.group,
            preferences: prefs || null
        };
    }
    async updateSkillsAndInterests(userId: number, data: { skillIds?: number[]; interestIds?: number[] }) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        if (user.age === null) {
            throw new Error("User age must be set before updating skills and interests");
        }

        let prefs = await UserPreferences.findOne({ where: { userId } });
        if (!prefs) {
            // Create with defaults if not exists, though unlikely if age is set (usually created on first step? no, age is just user update)
            // actually onboarding steps might create prefs.
            prefs = await UserPreferences.create({
                userId,
                skillIds: data.skillIds || [],
                interestIds: data.interestIds || []
            });
        } else {
            const updateData: any = {};
            if (data.skillIds !== undefined) updateData.skillIds = data.skillIds;
            if (data.interestIds !== undefined) updateData.interestIds = data.interestIds;
            await prefs.update(updateData);
        }

        return prefs;
    }

    async getUserSkillsAndInterests(userId: number) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        if (user.age === null) {
            throw new Error("User age must be set to access skills and interests");
        }

        const prefs = await UserPreferences.findOne({ where: { userId } });
        const skills = await Skill.findAll({ where: { id: { [Op.in]: prefs?.skillIds || [] } } });
        const interests = await Interest.findAll({ where: { id: { [Op.in]: prefs?.interestIds || [] } } });

        return {
            skills,
            interests
        };
    }
}

export const onboardingService = new OnboardingService();
