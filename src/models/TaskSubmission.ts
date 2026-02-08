import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class TaskSubmission extends Model {
    declare id: number;
    declare taskId: number;
    declare userId: number;
    declare submissionContent: string;
    declare submissionUrl: string | null;
    declare submittedAt: Date;
    declare feedback: string | null;
    declare score: number | null;
    declare status: "submitted" | "reviewed" | "approved" | "needs_revision";
}

TaskSubmission.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        taskId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "tasks",
                key: "id"
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id"
            }
        },
        submissionContent: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        submissionUrl: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        submittedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        feedback: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        score: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM("submitted", "reviewed", "approved", "needs_revision"),
            defaultValue: "submitted"
        }
    },
    {
        sequelize,
        tableName: "task_submissions",
        timestamps: true
    }
);

export default TaskSubmission;
