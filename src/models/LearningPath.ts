import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class LearningPath extends Model {
    declare id: number;
    declare name: string;
    declare path: any; // JSON type
    declare userId: number;
    declare userPreferencesId: number | null;
    declare status: "generating" | "completed" | "failed";
    declare generationError: string | null;
    declare generatedAt: Date | null;
    declare personalizedReason: string | null;
    declare totalEstimatedHours: number | null;
    declare currentModuleId: number | null;
    declare currentTaskId: number | null;
    declare completionPercentage: number;
    declare createdAt: Date;
    declare updatedAt: Date;
}

LearningPath.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        path: {
            type: DataTypes.JSONB,
            allowNull: true // Nullable until generation completes
        },
        userPreferencesId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "user_preferences",
                key: "id"
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("generating", "completed", "failed"),
            defaultValue: "generating",
            allowNull: false
        },
        generationError: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        generatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        personalizedReason: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        totalEstimatedHours: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        currentModuleId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        currentTaskId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        completionPercentage: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0
        }
    },
    {
        sequelize,
        tableName: "learning_paths",
        timestamps: true, // Enables createdAt and updatedAt
        indexes: [
            {
                fields: ["userId"]
            },
            {
                fields: ["status"]
            }
        ]
    }
);

export default LearningPath;
