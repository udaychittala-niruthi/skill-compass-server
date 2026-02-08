import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Resource extends Model {
    declare id: number;
    declare lessonId: number | null;
    declare moduleId: number | null;
    declare type: "video" | "article" | "pdf" | "interactive" | "documentation";
    declare title: string;
    declare url: string;
    declare description: string | null;
    declare isPrimary: boolean;
    declare estimatedTime: number;
    declare provider: string | null;
}

Resource.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        lessonId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "lessons",
                key: "id"
            }
        },
        moduleId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "learning_modules",
                key: "id"
            }
        },
        type: {
            type: DataTypes.ENUM("video", "article", "pdf", "interactive", "documentation"),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        url: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isPrimary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        estimatedTime: {
            type: DataTypes.INTEGER,
            defaultValue: 10
        },
        provider: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: "resources",
        timestamps: true
    }
);

export default Resource;
