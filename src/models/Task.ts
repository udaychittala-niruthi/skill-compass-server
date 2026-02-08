import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Task extends Model {
    declare id: number;
    declare lessonId: number;
    declare title: string;
    declare type: "reading" | "coding" | "quiz" | "project" | "discussion" | "reflection";
    declare instructions: any;
    declare purpose: string | null;
    declare completionCriteria: any;
    declare difficultyLevel: number;
    declare estimatedMinutes: number;
    declare orderInLesson: number;
    declare isRequired: boolean;
    declare points: number;
}

Task.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        lessonId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "lessons",
                key: "id"
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM("reading", "coding", "quiz", "project", "discussion", "reflection"),
            allowNull: false
        },
        instructions: {
            type: DataTypes.JSONB,
            defaultValue: {}
        },
        purpose: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        completionCriteria: {
            type: DataTypes.JSONB,
            defaultValue: {}
        },
        difficultyLevel: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            validate: {
                min: 1,
                max: 5
            }
        },
        estimatedMinutes: {
            type: DataTypes.INTEGER,
            defaultValue: 5
        },
        orderInLesson: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        isRequired: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        points: {
            type: DataTypes.INTEGER,
            defaultValue: 10
        }
    },
    {
        sequelize,
        tableName: "tasks",
        timestamps: true
    }
);

export default Task;
