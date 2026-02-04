import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Certification extends Model {
    declare id: number;
    declare name: string;
    declare issuingOrganization: string;
    declare certificationUrl: string | null;
    declare description: string | null;
    declare metadata: any; // JSONB
    declare skillTags: string[];
}

Certification.init(
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
        issuingOrganization: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        certificationUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        metadata: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
        skillTags: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
    },
    {
        sequelize,
        tableName: "certifications",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["name", "issuingOrganization"],
            },
        ],
    }
);

export default Certification;
