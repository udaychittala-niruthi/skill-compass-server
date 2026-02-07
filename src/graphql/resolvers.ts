
import {
    User, Interest, Skill, Course, Branches, LearningPath,
    UserPreferences, LearningModule, UserModuleProgress,
    Assessment, Certification, UserCertification, UserPortfolio,
    LearningSchedule, AiAnalysis, EducationalResource
} from "../models";

export const resolvers = {
    Query: {
        users: async () => await User.findAll(),
        user: async (_: any, { id }: { id: string }) => await User.findByPk(id),

        interests: async () => await Interest.findAll(),
        interest: async (_: any, { id }: { id: string }) => await Interest.findByPk(id),

        skills: async () => await Skill.findAll(),
        skill: async (_: any, { id }: { id: string }) => await Skill.findByPk(id),

        courses: async () => await Course.findAll(),
        course: async (_: any, { id }: { id: string }) => await Course.findByPk(id),

        branches: async () => await Branches.findAll(),
        branch: async (_: any, { id }: { id: string }) => await Branches.findByPk(id),

        learningPaths: async () => await LearningPath.findAll(),
        learningPath: async (_: any, { id }: { id: string }) => await LearningPath.findByPk(id),

        userPreferences: async () => await UserPreferences.findAll(),
        userPreference: async (_: any, { id }: { id: string }) => await UserPreferences.findByPk(id),

        learningModules: async () => await LearningModule.findAll(),
        learningModule: async (_: any, { id }: { id: string }) => await LearningModule.findByPk(id),

        userModuleProgresses: async () => await UserModuleProgress.findAll(),
        userModuleProgress: async (_: any, { id }: { id: string }) => await UserModuleProgress.findByPk(id),

        assessments: async () => await Assessment.findAll(),
        assessment: async (_: any, { id }: { id: string }) => await Assessment.findByPk(id),

        certifications: async () => await Certification.findAll(),
        certification: async (_: any, { id }: { id: string }) => await Certification.findByPk(id),

        userCertifications: async () => await UserCertification.findAll(),
        userCertification: async (_: any, { id }: { id: string }) => await UserCertification.findByPk(id),

        userPortfolios: async () => await UserPortfolio.findAll(),
        userPortfolio: async (_: any, { id }: { id: string }) => await UserPortfolio.findByPk(id),

        learningSchedules: async () => await LearningSchedule.findAll(),
        learningSchedule: async (_: any, { id }: { id: string }) => await LearningSchedule.findByPk(id),

        aiAnalyses: async () => await AiAnalysis.findAll(),
        aiAnalysis: async (_: any, { id }: { id: string }) => await AiAnalysis.findByPk(id),

        educationalResources: async () => await EducationalResource.findAll(),
        educationalResource: async (_: any, { id }: { id: string }) => await EducationalResource.findByPk(id),

        dashboardStats: async () => {
            const totalUsers = await User.count();
            const totalCourses = await Course.count();
            const totalModules = await LearningModule.count();
            // Assuming active users are those who logged in recently or just total for now
            const activeUsers = await User.count({ where: { isOnboarded: true } });
            return { totalUsers, totalCourses, totalModules, activeUsers };
        }
    },

    // Field Resolvers for Associations
    User: {
        learningPath: (parent: any) => LearningPath.findOne({ where: { userId: parent.id } }),
        preferences: (parent: any) => UserPreferences.findOne({ where: { userId: parent.id } }),
        assessments: (parent: any) => Assessment.findAll({ where: { userId: parent.id } }),
        certifications: (parent: any) => UserCertification.findAll({ where: { userId: parent.id } }),
        portfolio: (parent: any) => UserPortfolio.findOne({ where: { userId: parent.id } }),
        schedules: (parent: any) => LearningSchedule.findAll({ where: { userId: parent.id } }),
        aiAnalyses: (parent: any) => AiAnalysis.findAll({ where: { userId: parent.id } }),
        moduleProgress: (parent: any) => UserModuleProgress.findAll({ where: { userId: parent.id } }),
    },

    Course: {
        branches: (parent: any) => Branches.findAll({ where: { courseId: parent.id } }),
        modules: (parent: any) => LearningModule.findAll({ where: { courseId: parent.id } }),
    },

    Branch: {
        course: (parent: any) => Course.findByPk(parent.courseId),
    },

    LearningPath: {
        user: (parent: any) => User.findByPk(parent.userId),
        userPreferences: (parent: any) => UserPreferences.findByPk(parent.userPreferencesId),
        modules: (parent: any) => LearningModule.findAll({ where: { learningPathId: parent.id } }),
        schedules: (parent: any) => LearningSchedule.findAll({ where: { learningPathId: parent.id } }),
    },

    UserPreferences: {
        user: (parent: any) => User.findByPk(parent.userId),
        course: (parent: any) => Course.findByPk(parent.courseId),
        branch: (parent: any) => Branches.findByPk(parent.branchId),
    },

    LearningModule: {
        course: (parent: any) => Course.findByPk(parent.courseId),
        learningPath: (parent: any) => LearningPath.findByPk(parent.learningPathId),
        assessments: (parent: any) => Assessment.findAll({ where: { moduleId: parent.id } }),
        userProgress: (parent: any) => UserModuleProgress.findAll({ where: { moduleId: parent.id } }),
    },

    UserModuleProgress: {
        user: (parent: any) => User.findByPk(parent.userId),
        module: (parent: any) => LearningModule.findByPk(parent.moduleId),
    },

    Assessment: {
        user: (parent: any) => User.findByPk(parent.userId),
        module: (parent: any) => LearningModule.findByPk(parent.moduleId),
    },

    Certification: {
        userProgress: (parent: any) => UserCertification.findAll({ where: { certificationId: parent.id } }),
    },

    UserCertification: {
        user: (parent: any) => User.findByPk(parent.userId),
        certification: (parent: any) => Certification.findByPk(parent.certificationId),
    },

    UserPortfolio: {
        user: (parent: any) => User.findByPk(parent.userId),
    },

    LearningSchedule: {
        user: (parent: any) => User.findByPk(parent.userId),
        learningPath: (parent: any) => LearningPath.findByPk(parent.learningPathId),
    },

    AiAnalysis: {
        user: (parent: any) => User.findByPk(parent.userId),
    },
};
