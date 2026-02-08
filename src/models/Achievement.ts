import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Achievement extends Model {
    declare id: number;
    declare name: string;
    declare description: string;
    declare iconUrl: string | null;
    declare category: "streak" | "completion" | "mastery" | "social" | "milestone";
    declare criteria: any;
    declare points: number;
    declare rarity: "common" | "rare" | "epic" | "legendary";
}

Achievement.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        iconUrl: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        category: {
            type: DataTypes.ENUM("streak", "completion", "mastery", "social", "milestone"),
            allowNull: false
        },
        criteria: {
            type: DataTypes.JSONB,
            defaultValue: {}
        },
        points: {
            type: DataTypes.INTEGER,
            defaultValue: 50
        },
        rarity: {
            type: DataTypes.ENUM("common", "rare", "epic", "legendary"),
            defaultValue: "common"
        }
    },
    {
        sequelize,
        tableName: "achievements",
        timestamps: true
    }
);

export default Achievement;
