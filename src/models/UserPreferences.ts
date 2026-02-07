import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class UserPreferences extends Model {
    declare id: number;
    declare userId: number;
    declare interestIds: number[];
    declare skillIds: number[];
    declare courseId: number | null; // For college students
    declare branchId: number | null; // For college students
    declare currentRole: string | null; // For professionals
    declare targetRole: string | null; // For professionals
    declare industry: string | null; // For professionals
    declare yearsOfExperience: number | null; // For professionals
    declare weeklyLearningHours: number;
    declare learningStyle: string | null; // 'visual', 'hands-on', 'reading', 'mixed'
    declare groupSpecificData: any; // JSONB
}

UserPreferences.init(
    {
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
    },
    {
        sequelize,
        tableName: "user_preferences",
        timestamps: true
    }
);

export default UserPreferences;
