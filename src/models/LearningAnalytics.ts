import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class LearningAnalytics extends Model {
    declare id: number;
    declare userId: number;
    declare date: Date;
    declare timeSpentMinutes: number;
    declare tasksCompleted: number;
    declare lessonsCompleted: number;
    declare modulesCompleted: number;
    declare averageScore: number | null;
    declare activeStreakDays: number;
    declare pointsEarned: number;
}

LearningAnalytics.init(
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
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        timeSpentMinutes: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        tasksCompleted: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        lessonsCompleted: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        modulesCompleted: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        averageScore: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true
        },
        activeStreakDays: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        pointsEarned: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    },
    {
        sequelize,
        tableName: "learning_analytics",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["userId", "date"]
            }
        ]
    }
);

export default LearningAnalytics;
