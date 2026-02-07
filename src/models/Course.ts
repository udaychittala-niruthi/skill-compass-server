import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Course extends Model {
    declare id: number;
    declare name: string;
    declare category: string;
}

Course.init(
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
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        iconLibrary: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "courses",
        timestamps: false,
    }
);

export default Course;
