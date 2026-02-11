import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";
class User extends Model {
}
User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    group: {
        type: DataTypes.ENUM("KIDS", "TEENS", "COLLEGE_STUDENTS", "PROFESSIONALS", "SENIORS"),
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM("USER", "ADMIN"),
        defaultValue: "USER"
    },
    isOnboarded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    tableName: "users",
    timestamps: true // This adds createdAt and updatedAt automatically
});
export default User;
