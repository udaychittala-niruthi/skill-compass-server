import { User, Interest, Skill, Course, Branches, LearningPath, UserPreferences, LearningModule, UserModuleProgress, Assessment, Certification, UserCertification, UserPortfolio, LearningSchedule, AiAnalysis, EducationalResource } from "../models/index.js";
export const resolvers = {
    Query: {
        users: async () => await User.findAll(),
        user: async (_, { id }) => await User.findByPk(id),
        interests: async () => await Interest.findAll(),
        interest: async (_, { id }) => await Interest.findByPk(id),
        skills: async () => await Skill.findAll(),
        skill: async (_, { id }) => await Skill.findByPk(id),
        courses: async () => await Course.findAll(),
        course: async (_, { id }) => await Course.findByPk(id),
        branches: async () => await Branches.findAll(),
        branch: async (_, { id }) => await Branches.findByPk(id),
        learningPaths: async () => await LearningPath.findAll(),
        learningPath: async (_, { id }) => await LearningPath.findByPk(id),
        userPreferences: async () => await UserPreferences.findAll(),
        userPreference: async (_, { id }) => await UserPreferences.findByPk(id),
        learningModules: async () => await LearningModule.findAll(),
        learningModule: async (_, { id }) => await LearningModule.findByPk(id),
        userModuleProgresses: async () => await UserModuleProgress.findAll(),
        userModuleProgress: async (_, { id }) => await UserModuleProgress.findByPk(id),
        assessments: async () => await Assessment.findAll(),
        assessment: async (_, { id }) => await Assessment.findByPk(id),
        certifications: async () => await Certification.findAll(),
        certification: async (_, { id }) => await Certification.findByPk(id),
        userCertifications: async () => await UserCertification.findAll(),
        userCertification: async (_, { id }) => await UserCertification.findByPk(id),
        userPortfolios: async () => await UserPortfolio.findAll(),
        userPortfolio: async (_, { id }) => await UserPortfolio.findByPk(id),
        learningSchedules: async () => await LearningSchedule.findAll(),
        learningSchedule: async (_, { id }) => await LearningSchedule.findByPk(id),
        aiAnalyses: async () => await AiAnalysis.findAll(),
        aiAnalysis: async (_, { id }) => await AiAnalysis.findByPk(id),
        educationalResources: async () => await EducationalResource.findAll(),
        educationalResource: async (_, { id }) => await EducationalResource.findByPk(id),
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
        learningPath: (parent) => LearningPath.findOne({ where: { userId: parent.id } }),
        preferences: (parent) => UserPreferences.findOne({ where: { userId: parent.id } }),
        assessments: (parent) => Assessment.findAll({ where: { userId: parent.id } }),
        certifications: (parent) => UserCertification.findAll({ where: { userId: parent.id } }),
        portfolio: (parent) => UserPortfolio.findOne({ where: { userId: parent.id } }),
        schedules: (parent) => LearningSchedule.findAll({ where: { userId: parent.id } }),
        aiAnalyses: (parent) => AiAnalysis.findAll({ where: { userId: parent.id } }),
        moduleProgress: (parent) => UserModuleProgress.findAll({ where: { userId: parent.id } })
    },
    Course: {
        branches: (parent) => Branches.findAll({ where: { courseId: parent.id } }),
        modules: (parent) => LearningModule.findAll({ where: { courseId: parent.id } })
    },
    Branch: {
        course: (parent) => Course.findByPk(parent.courseId)
    },
    LearningPath: {
        user: (parent) => User.findByPk(parent.userId),
        userPreferences: (parent) => UserPreferences.findByPk(parent.userPreferencesId),
        modules: (parent) => LearningModule.findAll({ where: { learningPathId: parent.id } }),
        schedules: (parent) => LearningSchedule.findAll({ where: { learningPathId: parent.id } })
    },
    UserPreferences: {
        user: (parent) => User.findByPk(parent.userId),
        course: (parent) => Course.findByPk(parent.courseId),
        branch: (parent) => Branches.findByPk(parent.branchId)
    },
    LearningModule: {
        course: (parent) => Course.findByPk(parent.courseId),
        learningPath: (parent) => LearningPath.findByPk(parent.learningPathId),
        assessments: (parent) => Assessment.findAll({ where: { moduleId: parent.id } }),
        userProgress: (parent) => UserModuleProgress.findAll({ where: { moduleId: parent.id } })
    },
    UserModuleProgress: {
        user: (parent) => User.findByPk(parent.userId),
        module: (parent) => LearningModule.findByPk(parent.moduleId)
    },
    Assessment: {
        user: (parent) => User.findByPk(parent.userId),
        module: (parent) => LearningModule.findByPk(parent.moduleId)
    },
    Certification: {
        userProgress: (parent) => UserCertification.findAll({ where: { certificationId: parent.id } })
    },
    UserCertification: {
        user: (parent) => User.findByPk(parent.userId),
        certification: (parent) => Certification.findByPk(parent.certificationId)
    },
    UserPortfolio: {
        user: (parent) => User.findByPk(parent.userId)
    },
    LearningSchedule: {
        user: (parent) => User.findByPk(parent.userId),
        learningPath: (parent) => LearningPath.findByPk(parent.learningPathId)
    },
    AiAnalysis: {
        user: (parent) => User.findByPk(parent.userId)
    }
};
