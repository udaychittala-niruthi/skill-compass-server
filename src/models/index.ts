import sequelize from "../config/db";
import { Op } from "sequelize";
import User from "./User";
import Interest from "./Interest";
import Skill from "./Skill";
import Course from "./Course";
import Branches from "./Branches"; // Assuming this still exists
import LearningPath from "./LearningPath";
import UserPreferences from "./UserPreferences";
import LearningModule from "./LearningModule";
import UserModuleProgress from "./UserModuleProgress";
import Assessment from "./Assessment";
import Certification from "./Certification";
import UserCertification from "./UserCertification";
import UserPortfolio from "./UserPortfolio";
import LearningSchedule from "./LearningSchedule";
import AiAnalysis from "./AiAnalysis";
import EducationalResource from "./EducationalResource";

// 1. USER PREFERENCES
User.hasOne(UserPreferences, { foreignKey: "userId", as: "preferences" });
UserPreferences.belongsTo(User, { foreignKey: "userId", as: "user" });



// UserPreferences.interestIds and UserPreferences.skillIds are arrays, so no standard SQL association here
// We can handle lookups manually or via utility functions
UserPreferences.belongsTo(Course, { foreignKey: "courseId", as: "course" });
UserPreferences.belongsTo(Branches, { foreignKey: "branchId", as: "branch" });

// 2. LEARNING MODULES
LearningModule.belongsTo(Course, { foreignKey: "courseId", as: "course" });
Course.hasMany(LearningModule, { foreignKey: "courseId", as: "modules" });

// 3. USER MODULE PROGRESS
User.hasMany(UserModuleProgress, { foreignKey: "userId", as: "moduleProgress" });
UserModuleProgress.belongsTo(User, { foreignKey: "userId", as: "user" });

LearningModule.hasMany(UserModuleProgress, { foreignKey: "moduleId", as: "userProgress" });
UserModuleProgress.belongsTo(LearningModule, { foreignKey: "moduleId", as: "module" });

// 4. LEARNING PATHS
User.hasOne(LearningPath, { foreignKey: "userId", as: "learningPath" });
LearningPath.belongsTo(User, { foreignKey: "userId", as: "user" });

LearningPath.belongsTo(UserPreferences, {
    foreignKey: "userPreferencesId",
    as: "userPreferences",
});
UserPreferences.hasMany(LearningPath, {
    foreignKey: "userPreferencesId",
    as: "learningPaths",
});

// LearningPath - LearningModule association
LearningPath.hasMany(LearningModule, { foreignKey: "learningPathId", as: "modules" });
LearningModule.belongsTo(LearningPath, { foreignKey: "learningPathId", as: "learningPath" });

// 5. ASSESSMENTS
User.hasMany(Assessment, { foreignKey: "userId", as: "assessments" });
Assessment.belongsTo(User, { foreignKey: "userId", as: "user" });

LearningModule.hasMany(Assessment, { foreignKey: "moduleId", as: "assessments" });
Assessment.belongsTo(LearningModule, { foreignKey: "moduleId", as: "module" });

// 6. CERTIFICATIONS (Catalog) - No direct user relation, mostly static

// 7. USER CERTIFICATIONS
User.hasMany(UserCertification, { foreignKey: "userId", as: "certifications" });
UserCertification.belongsTo(User, { foreignKey: "userId", as: "user" });

Certification.hasMany(UserCertification, { foreignKey: "certificationId", as: "userProgress" });
UserCertification.belongsTo(Certification, { foreignKey: "certificationId", as: "certification" });

// 8. USER PORTFOLIOS
User.hasOne(UserPortfolio, { foreignKey: "userId", as: "portfolio" });
UserPortfolio.belongsTo(User, { foreignKey: "userId", as: "user" });

// 9. LEARNING SCHEDULES
User.hasMany(LearningSchedule, { foreignKey: "userId", as: "schedules" });
LearningSchedule.belongsTo(User, { foreignKey: "userId", as: "user" });

LearningPath.hasMany(LearningSchedule, { foreignKey: "learningPathId", as: "schedules" });
LearningSchedule.belongsTo(LearningPath, { foreignKey: "learningPathId", as: "learningPath" });

// 10. AI ANALYSES
User.hasMany(AiAnalysis, { foreignKey: "userId", as: "aiAnalyses" });
AiAnalysis.belongsTo(User, { foreignKey: "userId", as: "user" });


// Existing Course - Branches relation
Course.hasMany(Branches, {
    foreignKey: "courseId",
    as: "branches",
});
Branches.belongsTo(Course, {
    foreignKey: "courseId",
    as: "course",
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
    Op,
};
