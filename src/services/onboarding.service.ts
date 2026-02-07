import { User, UserPreferences } from "../models";
import { learningPathService } from "./learningPath.service";
import { Op } from "sequelize";
import { Skill, Interest } from "../models";

class OnboardingService {
    async onboardKid(userId: number, data: { avatar?: string; bio?: string }) {
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

    async onboardTeen(userId: number, data: { interestIds: number[]; skillIds: number[]; bio?: string }) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        let prefs = await UserPreferences.findOne({ where: { userId } });
        if (!prefs) {
            prefs = await UserPreferences.create({ userId, ...data });
        } else {
            await prefs.update(data);
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
        data: { courseId: number; branchId: number; bio?: string; skills?: number[] }
    ) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        let prefs = await UserPreferences.findOne({ where: { userId } });
        if (!prefs) {
            prefs = await UserPreferences.create({
                userId,
                courseId: data.courseId,
                branchId: data.branchId,
                skillIds: data.skills || [],
                bio: data.bio
            });
        } else {
            await prefs.update({
                courseId: data.courseId,
                branchId: data.branchId,
                skillIds: data.skills || [],
                bio: data.bio
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
        data: { currentRole: string; industry: string; yearsOfExperience: number; skills?: number[]; bio?: string }
    ) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        let prefs = await UserPreferences.findOne({ where: { userId } });
        if (!prefs) {
            prefs = await UserPreferences.create({
                userId,
                currentRole: data.currentRole,
                industry: data.industry,
                yearsOfExperience: data.yearsOfExperience,
                skillIds: data.skills || [],
                bio: data.bio
            });
        } else {
            await prefs.update({
                currentRole: data.currentRole,
                industry: data.industry,
                yearsOfExperience: data.yearsOfExperience,
                skillIds: data.skills || [],
                bio: data.bio
            });
        }

        await user.update({ isOnboarded: true });

        // Trigger learning path generation (async - don't wait)
        learningPathService.generateLearningPath(userId).catch((err) => {
            console.error(`Failed to initiate learning path generation for user ${userId}:`, err);
        });

        return prefs;
    }

    async onboardSenior(userId: number, data: { interestIds?: number[]; bio?: string; accessibilitySettings?: any }) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        let prefs = await UserPreferences.findOne({ where: { userId } });
        if (!prefs) {
            prefs = await UserPreferences.create({
                userId,
                interestIds: data.interestIds || [],
                bio: data.bio,
                groupSpecificData: { accessibility: data.accessibilitySettings }
            });
        } else {
            await prefs.update({
                interestIds: data.interestIds || [],
                bio: data.bio,
                groupSpecificData: { ...prefs.groupSpecificData, accessibility: data.accessibilitySettings }
            });
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
        const skils = await Skill.findAll({ where: { id: { [Op.in]: prefs?.skillIds || [] } } });
        const interests = await Interest.findAll({ where: { id: { [Op.in]: prefs?.interestIds || [] } } });

        return {
            skils,
            interests
        };
    }
}

export const onboardingService = new OnboardingService();
