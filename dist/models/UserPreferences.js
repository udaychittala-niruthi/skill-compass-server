import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";
class UserPreferences extends Model {
}
UserPreferences.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: "users",
            key: "id"
        }
    },
    interestIds: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: []
    },
    skillIds: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: []
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "courses",
            key: "id"
        }
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "branches",
            key: "id"
        }
    },
    currentRole: {
        type: DataTypes.STRING,
        allowNull: true
    },
    targetRole: {
        type: DataTypes.STRING,
        allowNull: true
    },
    industry: {
        type: DataTypes.STRING,
        allowNull: true
    },
    yearsOfExperience: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    weeklyLearningHours: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    learningStyle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    groupSpecificData: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    sequelize,
    tableName: "user_preferences",
    timestamps: true
});
export default UserPreferences;
