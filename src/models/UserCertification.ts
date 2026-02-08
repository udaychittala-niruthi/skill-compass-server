import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

class UserCertification extends Model {
    declare id: number;
    declare userId: number;
    declare certificationId: number;
    declare status: "interested" | "preparing" | "scheduled" | "passed" | "failed" | "expired";
    declare progressData: any; // JSONB
}

UserCertification.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id"
            }
        },
        certificationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "certifications",
                key: "id"
            }
        },
        status: {
            type: DataTypes.ENUM("interested", "preparing", "scheduled", "passed", "failed", "expired"),
            defaultValue: "interested"
        },
        progressData: {
            type: DataTypes.JSONB,
            defaultValue: {}
        }
    },
    {
        sequelize,
        tableName: "user_certifications",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["userId", "certificationId"]
            }
        ]
    }
);

export default UserCertification;
