import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class LearningPath extends Model {
    declare id: number;
    declare name: string;
    declare path: any; // JSON type
    declare userId: number;
    declare userPreferencesId: number;
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
            type: DataTypes.JSON,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        userPreferencesId: {
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
