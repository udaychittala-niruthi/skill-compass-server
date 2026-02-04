import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class AiAnalysis extends Model {
    declare id: number;
    declare userId: number;
    declare analysisType: "skill-gap" | "learning-recommendation" | "career-path" | "study-plan" | "personalization";
    declare analysisData: any; // JSONB
    declare generatedBy: string;
    declare modelVersion: string | null;
    declare confidence: number | null;
    declare generatedAt: Date;
    declare expiresAt: Date | null;
}

AiAnalysis.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        analysisType: {
            type: DataTypes.ENUM(
                "skill-gap",
                "learning-recommendation",
                "career-path",
                "study-plan",
                "personalization"
            ),
            allowNull: false,
        },
        analysisData: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        generatedBy: {
            type: DataTypes.STRING(50),
            defaultValue: "groq-ai",
        },
        modelVersion: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        confidence: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: true,
            validate: {
                min: 0,
                max: 1,
            },
        },
        generatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "ai_analyses",
        timestamps: true,
    }
);

export default AiAnalysis;
