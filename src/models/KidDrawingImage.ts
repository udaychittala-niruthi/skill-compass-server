import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

class KidDrawingImage extends Model {
    declare id: number;
    declare url: string;
    declare type: "svg" | "png";
    declare category: string | null;
    declare isValid: boolean;
    declare lastChecked: Date;
}

KidDrawingImage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        url: {
            type: DataTypes.STRING(1024),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM("svg", "png"),
            allowNull: false,
            defaultValue: "svg"
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        isValid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        lastChecked: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        tableName: "kid_drawing_images",
        timestamps: true
    }
);

export default KidDrawingImage;
