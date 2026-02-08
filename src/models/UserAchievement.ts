import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class UserAchievement extends Model {
    declare id: number;
    declare userId: number;
    declare achievementId: number;
    declare earnedAt: Date | null;
    declare progress: number;
}

UserAchievement.init(
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
        achievementId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "achievements",
                key: "id"
            }
        },
        earnedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        progress: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0
        }
    },
    {
        sequelize,
        tableName: "user_achievements",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["userId", "achievementId"]
            }
        ]
    }
);

export default UserAchievement;
