import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class User extends Model {
    declare id: number;
    declare name: string;
    declare password: string;
    declare email: string;
    declare role: "USER" | "ADMIN";
}

User.init(
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
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        role: {
            type: DataTypes.ENUM("USER", "ADMIN"),
            defaultValue: "USER",
        },
    },
    {
        sequelize,
        tableName: "users",
        timestamps: true, // This adds createdAt and updatedAt automatically
    }
);

export default User;
