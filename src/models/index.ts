import sequelize from "../config/db";
import User from "./User";
import Interest from "./Interest";
import Skill from "./Skill";
import Course from "./Course";
import CollegeStudentPreferences from "./CollegeStudentPreferences";
import LearningPath from "./LearningPath";

// User - CollegeStudentPreferences (One-to-One)
User.hasOne(CollegeStudentPreferences, {
    foreignKey: "userId",
    as: "collegeStudentPreferences",
});
CollegeStudentPreferences.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

// CollegeStudentPreferences - Interest
Interest.hasMany(CollegeStudentPreferences, {
    foreignKey: "interestId",
    as: "collegeStudentPreferences",
});
CollegeStudentPreferences.belongsTo(Interest, {
    foreignKey: "interestId",
    as: "interest",
});

// CollegeStudentPreferences - Skill
Skill.hasMany(CollegeStudentPreferences, {
    foreignKey: "skillId",
    as: "collegeStudentPreferences",
});
CollegeStudentPreferences.belongsTo(Skill, {
    foreignKey: "skillId",
    as: "skill",
});

// CollegeStudentPreferences - Course
Course.hasMany(CollegeStudentPreferences, {
    foreignKey: "courseId",
    as: "collegeStudentPreferences",
});
CollegeStudentPreferences.belongsTo(Course, {
    foreignKey: "courseId",
    as: "course",
});

// CollegeStudentPreferences - Branches
Branches.hasMany(CollegeStudentPreferences, {
    foreignKey: "branchId",
    as: "collegeStudentPreferences",
});
CollegeStudentPreferences.belongsTo(Branches, {
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
    CollegeStudentPreferences,
    LearningPath,
    Branches,
};
