import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Skill extends Model {
    declare id: number;
    declare name: string;
}

Skill.init(
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
    },
    {
        sequelize,
        tableName: "skills",
        timestamps: false,
    }
);

export default Skill;
