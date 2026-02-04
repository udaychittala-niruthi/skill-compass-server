import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class UserPreferences extends Model {
    declare id: number;
    declare userId: number;
    declare interestId: number;
    declare skillId: number;
    declare courseId: number;
    declare branchId: number;
}

UserPreferences.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        interestId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        skillId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        courseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        branchId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "user_preferences",
        timestamps: false,
    }
);

export default UserPreferences;
