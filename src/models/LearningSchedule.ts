import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class LearningSchedule extends Model {
    declare id: number;
    declare userId: number;
    declare learningPathId: number | null;
    declare periodType: "daily" | "weekly" | "monthly";
    declare periodNumber: number;
    declare startDate: Date;
    declare endDate: Date | null;
    declare scheduleData: any; // JSONB
    declare status: "upcoming" | "active" | "completed" | "skipped";
    declare completionPercentage: number;
}

LearningSchedule.init(
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
        learningPathId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "learning_paths",
                key: "id"
            }
        },
        periodType: {
            type: DataTypes.ENUM("daily", "weekly", "monthly"),
            defaultValue: "weekly"
        },
        periodNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        scheduleData: {
            type: DataTypes.JSONB,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("upcoming", "active", "completed", "skipped"),
            defaultValue: "upcoming"
        },
        completionPercentage: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100
            }
        }
    },
    {
        sequelize,
        tableName: "learning_schedules",
        timestamps: true,
        indexes: [
            {
                unique: true,
                name: "unique_schedule_entry",
                fields: ["userId", "periodType", "periodNumber", "learningPathId"]
            }
        ]
    }
);

export default LearningSchedule;
