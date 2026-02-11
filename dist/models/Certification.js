import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";
class Certification extends Model {
}
Certification.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    issuingOrganization: {
        type: DataTypes.STRING,
        allowNull: false
    },
    certificationUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    skillTags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    }
}, {
    sequelize,
    tableName: "certifications",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ["name", "issuingOrganization"]
        }
    ]
});
export default Certification;
