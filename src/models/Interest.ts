import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Interest extends Model {
    declare id: number;
    declare name: string;
}

Interest.init(
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
        tableName: "interests",
        timestamps: false,
    }
);

export default Interest;
