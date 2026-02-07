import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

/**
 * Educational Resource Model
 * Stores curated learning resources (PDFs, videos, tutorials) with keywords for matching
 */
class EducationalResource extends Model {
    declare id: number;
    declare title: string;
    declare url: string;
    declare resourceType: "pdf" | "video" | "tutorial" | "documentation" | "course" | "book";
    declare keywords: string[]; // Array of keywords for matching
    declare description: string | null;
    declare provider: string | null; // e.g., "MIT OCW", "MDN", "Official Docs"
    declare difficulty: "beginner" | "intermediate" | "advanced" | "all" | null;
    declare isPremium: boolean;
    declare rating: number | null; // 1-5
    declare createdAt?: Date;
    declare updatedAt?: Date;
}

EducationalResource.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        url: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                isUrl: true
            }
        },
        resourceType: {
            type: DataTypes.ENUM("pdf", "video", "tutorial", "documentation", "course", "book"),
            allowNull: false,
            defaultValue: "tutorial"
        },
        keywords: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: [],
            comment: "Keywords for matching with module topics"
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        provider: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "Source/provider of the resource (e.g., MIT, MDN, freeCodeCamp)"
        },
        difficulty: {
            type: DataTypes.ENUM("beginner", "intermediate", "advanced", "all"),
            allowNull: true,
            defaultValue: "all"
        },
        isPremium: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: "Whether the resource requires payment"
        },
        rating: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: true,
            validate: {
                min: 1.0,
                max: 5.0
            },
            comment: "Quality rating 1-5"
        }
    },
    {
        sequelize,
        tableName: "educational_resources",
        timestamps: true,
        indexes: [
            {
                fields: ["keywords"],
                using: "gin" // PostgreSQL GIN index for array searching
            },
            {
                fields: ["resourceType"]
            },
            {
                fields: ["isPremium"]
            }
        ]
    }
);

export default EducationalResource;
