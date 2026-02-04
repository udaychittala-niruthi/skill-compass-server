import sequelize from "../config/db";
import User from "./User";
import Interest from "./Interest";
import Skill from "./Skill";
import Course from "./Course";
import UserPreferences from "./UserPreferences";
import LearningPath from "./LearningPath";

// User - UserPreferences (One-to-One)
User.hasOne(UserPreferences, {
    foreignKey: "userId",
    as: "userPreferences",
});
UserPreferences.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

// UserPreferences - Interest
Interest.hasMany(UserPreferences, {
    foreignKey: "interestId",
    as: "userPreferences",
});
UserPreferences.belongsTo(Interest, {
    foreignKey: "interestId",
    as: "interest",
});

// UserPreferences - Skill
Skill.hasMany(UserPreferences, {
    foreignKey: "skillId",
    as: "userPreferences",
});
UserPreferences.belongsTo(Skill, {
    foreignKey: "skillId",
    as: "skill",
});

// UserPreferences - Course
Course.hasMany(UserPreferences, {
    foreignKey: "courseId",
    as: "userPreferences",
});
UserPreferences.belongsTo(Course, {
    foreignKey: "courseId",
    as: "course",
});

// UserPreferences - Branches
Branches.hasMany(UserPreferences, {
    foreignKey: "branchId",
    as: "userPreferences",
});
UserPreferences.belongsTo(Branches, {
    foreignKey: "branchId",
    as: "branch",
});

// Course - Branches (One-to-Many)
import Branches from "./Branches";
Course.hasMany(Branches, {
    foreignKey: "courseId",
    as: "branches",
});
Branches.belongsTo(Course, {
    foreignKey: "courseId",
    as: "course",
});

// User - LearningPath (One-to-One)
User.hasOne(LearningPath, {
    foreignKey: "userId",
    as: "learningPath",
});
LearningPath.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

export {
    sequelize,
    User,
    Interest,
    Skill,
    Course,
    UserPreferences,
    LearningPath,
    Branches,
};
