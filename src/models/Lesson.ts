import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Lesson extends Model {
    declare id: number;
    declare moduleId: number;
    declare title: string;
    declare objective: string | null;
    declare keyTakeaways: string[];
    declare contentType: "video" | "article" | "interactive" | "quiz";
    declare contentUrl: string | null;
    declare estimatedMinutes: number;
    declare orderInModule: number;
    declare whyLearnThis: string | null;
    declare prerequisites: number[];
    declare status: "locked" | "available" | "in_progress" | "completed";
}

Lesson.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        moduleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "learning_modules",
                key: "id"
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        objective: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        keyTakeaways: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },
        contentType: {
            type: DataTypes.ENUM("video", "article", "interactive", "quiz"),
            allowNull: false
        },
        contentUrl: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        estimatedMinutes: {
            type: DataTypes.INTEGER,
            defaultValue: 15
        },
        orderInModule: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        whyLearnThis: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        prerequisites: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            defaultValue: []
        },
        status: {
            type: DataTypes.ENUM("locked", "available", "in_progress", "completed"),
            defaultValue: "locked"
        }
    },
    {
        sequelize,
        tableName: "lessons",
        timestamps: true
    }
);

export default Lesson;
