import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class LearningPath extends Model {
    declare id: number;
    declare name: string;
    declare path: any; // JSON type
    declare userId: number;
    declare userPreferencesId: number | null;
}

LearningPath.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        path: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        userPreferencesId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "user_preferences",
                key: "id",
            },
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: "learning_paths",
        timestamps: false,
    }
);

export default LearningPath;
