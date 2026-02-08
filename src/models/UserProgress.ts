import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class UserProgress extends Model {
    declare id: number;
    declare userId: number;
    declare pathId: number | null;
    declare moduleId: number | null;
    declare lessonId: number | null;
    declare taskId: number | null;
    declare status: "not_started" | "in_progress" | "completed" | "skipped";
    declare completionPercentage: number;
    declare timeSpentMinutes: number;
    declare score: number | null;
    declare lastAccessedAt: Date;
    declare completedAt: Date | null;
    declare bookmarked: boolean;
    declare notes: string | null;
    declare metadata: any;
}

UserProgress.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id"
            }
        },
        pathId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "learning_paths",
                key: "id"
            }
        },
        moduleId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "learning_modules",
                key: "id"
            }
        },
        lessonId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "lessons",
                key: "id"
            }
        },
        taskId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "tasks",
                key: "id"
            }
        },
        status: {
            type: DataTypes.ENUM("not_started", "in_progress", "completed", "skipped"),
            defaultValue: "not_started"
        },
        completionPercentage: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        timeSpentMinutes: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        score: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true
        },
        lastAccessedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        bookmarked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        metadata: {
            type: DataTypes.JSONB,
            defaultValue: {}
        }
    },
    {
        sequelize,
        tableName: "user_progress",
        timestamps: true,
        indexes: [
            {
                fields: ["userId"]
            },
            {
                fields: ["userId", "pathId"]
            },
            {
                fields: ["userId", "moduleId"]
            },
            {
                fields: ["userId", "lessonId"]
            },
            {
                fields: ["userId", "taskId"]
            }
        ]
    }
);

export default UserProgress;
