import sequelize from "../config/db.js";
import { Op } from "sequelize";
import User from "./User.js";
import Interest from "./Interest.js";
import Skill from "./Skill.js";
import Course from "./Course.js";
import Branches from "./Branches.js";
import LearningPath from "./LearningPath.js";
import UserPreferences from "./UserPreferences.js";
import LearningModule from "./LearningModule.js";
import UserModuleProgress from "./UserModuleProgress.js";
import Assessment from "./Assessment.js";
import Certification from "./Certification.js";
import UserCertification from "./UserCertification.js";
import UserPortfolio from "./UserPortfolio.js";
import LearningSchedule from "./LearningSchedule.js";
import AiAnalysis from "./AiAnalysis.js";
import EducationalResource from "./EducationalResource.js";
import Lesson from "./Lesson.js";
import Task from "./Task.js";
import Resource from "./Resource.js";
import UserProgress from "./UserProgress.js";
import TaskSubmission from "./TaskSubmission.js";
import LearningAnalytics from "./LearningAnalytics.js";
import Achievement from "./Achievement.js";
import UserAchievement from "./UserAchievement.js";

// 1. USER PREFERENCES
User.hasOne(UserPreferences, { foreignKey: "userId", as: "preferences" });
UserPreferences.belongsTo(User, { foreignKey: "userId", as: "user" });

// UserPreferences.interestIds and UserPreferences.skillIds are arrays, so no standard SQL association here
// We can handle lookups manually or via utility functions
UserPreferences.belongsTo(Course, { foreignKey: "courseId", as: "course", onDelete: "SET NULL" });
UserPreferences.belongsTo(Branches, { foreignKey: "branchId", as: "branch", onDelete: "SET NULL" });

// 2. LEARNING MODULES
LearningModule.belongsTo(Course, { foreignKey: "courseId", as: "course", onDelete: "CASCADE" });
Course.hasMany(LearningModule, { foreignKey: "courseId", as: "modules", onDelete: "CASCADE" });

// 3. USER MODULE PROGRESS (Legacy - Keeping for compatibility or later migration)
User.hasMany(UserModuleProgress, { foreignKey: "userId", as: "moduleProgress" });
UserModuleProgress.belongsTo(User, { foreignKey: "userId", as: "user" });

LearningModule.hasMany(UserModuleProgress, { foreignKey: "moduleId", as: "moduleUserProgress", onDelete: "CASCADE" });
UserModuleProgress.belongsTo(LearningModule, { foreignKey: "moduleId", as: "module", onDelete: "CASCADE" });

// 4. LEARNING PATHS
User.hasMany(LearningPath, { foreignKey: "userId", as: "learningPaths" });
LearningPath.belongsTo(User, { foreignKey: "userId", as: "user" });

LearningPath.belongsTo(UserPreferences, {
    foreignKey: "userPreferencesId",
    as: "userPreferences"
});
UserPreferences.hasMany(LearningPath, {
    foreignKey: "userPreferencesId",
    as: "learningPaths"
});

// LearningPath - LearningModule association
LearningPath.hasMany(LearningModule, { foreignKey: "learningPathId", as: "modules" });
LearningModule.belongsTo(LearningPath, { foreignKey: "learningPathId", as: "learningPath" });

// 5. GRANULAR STRUCTURE (Lessons, Tasks, Resources)
LearningModule.hasMany(Lesson, { foreignKey: "moduleId", as: "lessons", onDelete: "CASCADE" });
Lesson.belongsTo(LearningModule, { foreignKey: "moduleId", as: "module", onDelete: "CASCADE" });

Lesson.hasMany(Task, { foreignKey: "lessonId", as: "tasks", onDelete: "CASCADE" });
Task.belongsTo(Lesson, { foreignKey: "lessonId", as: "lesson", onDelete: "CASCADE" });

Lesson.hasMany(Resource, { foreignKey: "lessonId", as: "resources", onDelete: "CASCADE" });
Resource.belongsTo(Lesson, { foreignKey: "lessonId", as: "lesson", onDelete: "CASCADE" });

LearningModule.hasMany(Resource, { foreignKey: "moduleId", as: "moduleResources", onDelete: "CASCADE" });
Resource.belongsTo(LearningModule, { foreignKey: "moduleId", as: "module", onDelete: "CASCADE" });

// 6. COMPREHENSIVE PROGRESS TRACKING
User.hasMany(UserProgress, { foreignKey: "userId", as: "detailedProgress" });
UserProgress.belongsTo(User, { foreignKey: "userId", as: "user" });

LearningPath.hasMany(UserProgress, { foreignKey: "pathId", as: "pathProgress" });
UserProgress.belongsTo(LearningPath, { foreignKey: "pathId", as: "path" });

LearningModule.hasMany(UserProgress, { foreignKey: "moduleId", as: "moduleProgress" });
UserProgress.belongsTo(LearningModule, { foreignKey: "moduleId", as: "module" });

Lesson.hasMany(UserProgress, { foreignKey: "lessonId", as: "lessonProgress" });
UserProgress.belongsTo(Lesson, { foreignKey: "lessonId", as: "lesson" });

Task.hasMany(UserProgress, { foreignKey: "taskId", as: "taskProgress" });
UserProgress.belongsTo(Task, { foreignKey: "taskId", as: "task" });

// 7. TASK SUBMISSIONS
Task.hasMany(TaskSubmission, { foreignKey: "taskId", as: "submissions", onDelete: "CASCADE" });
TaskSubmission.belongsTo(Task, { foreignKey: "taskId", as: "task", onDelete: "CASCADE" });

User.hasMany(TaskSubmission, { foreignKey: "userId", as: "taskSubmissions" });
TaskSubmission.belongsTo(User, { foreignKey: "userId", as: "user" });

// 8. LEARNING ANALYTICS
User.hasMany(LearningAnalytics, { foreignKey: "userId", as: "analytics" });
LearningAnalytics.belongsTo(User, { foreignKey: "userId", as: "user" });

// 9. GAMIFICATION
User.hasMany(UserAchievement, { foreignKey: "userId", as: "earnedAchievements" });
UserAchievement.belongsTo(User, { foreignKey: "userId", as: "user" });

Achievement.hasMany(UserAchievement, { foreignKey: "achievementId", as: "userAchievements", onDelete: "CASCADE" });
UserAchievement.belongsTo(Achievement, { foreignKey: "achievementId", as: "achievement", onDelete: "CASCADE" });

// 10. ASSESSMENTS
User.hasMany(Assessment, { foreignKey: "userId", as: "assessments" });
Assessment.belongsTo(User, { foreignKey: "userId", as: "user" });

LearningModule.hasMany(Assessment, { foreignKey: "moduleId", as: "assessments", onDelete: "CASCADE" });
Assessment.belongsTo(LearningModule, { foreignKey: "moduleId", as: "module", onDelete: "CASCADE" });

// 11. CERTIFICATIONS & PORTFOLIOS
User.hasMany(UserCertification, { foreignKey: "userId", as: "certifications" });
UserCertification.belongsTo(User, { foreignKey: "userId", as: "user" });

Certification.hasMany(UserCertification, { foreignKey: "certificationId", as: "userCertificationProgress" });
UserCertification.belongsTo(Certification, { foreignKey: "certificationId", as: "certification" });

User.hasOne(UserPortfolio, { foreignKey: "userId", as: "portfolio" });
UserPortfolio.belongsTo(User, { foreignKey: "userId", as: "user" });

// 12. LEARNING SCHEDULES
User.hasMany(LearningSchedule, { foreignKey: "userId", as: "schedules" });
LearningSchedule.belongsTo(User, { foreignKey: "userId", as: "user" });

LearningPath.hasMany(LearningSchedule, { foreignKey: "learningPathId", as: "schedules" });
LearningSchedule.belongsTo(LearningPath, { foreignKey: "learningPathId", as: "learningPath" });

// 13. AI ANALYSES
User.hasMany(AiAnalysis, { foreignKey: "userId", as: "aiAnalyses" });
AiAnalysis.belongsTo(User, { foreignKey: "userId", as: "user" });

// Existing Course - Branches relation
Course.hasMany(Branches, {
    foreignKey: "courseId",
    as: "branches",
    onDelete: "CASCADE"
});
Branches.belongsTo(Course, {
    foreignKey: "courseId",
    as: "course",
    onDelete: "CASCADE"
});

export {
    sequelize,
    User,
    Interest,
    Skill,
    Course,
    Branches,
    LearningPath,
    UserPreferences,
    LearningModule,
    UserModuleProgress,
    Assessment,
    Certification,
    UserCertification,
    UserPortfolio,
    LearningSchedule,
    AiAnalysis,
    EducationalResource,
    Lesson,
    Task,
    Resource,
    UserProgress,
    TaskSubmission,
    LearningAnalytics,
    Achievement,
    UserAchievement,
    Op
};
