import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";
class UserPortfolio extends Model {
}
UserPortfolio.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: "users",
            key: "id"
        }
    },
    headline: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    profileImageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    links: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    skillsShowcase: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    featuredWork: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: []
    },
    achievements: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    shareableSlug: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: true
    }
}, {
    sequelize,
    tableName: "user_portfolios",
    timestamps: true
});
export default UserPortfolio;
