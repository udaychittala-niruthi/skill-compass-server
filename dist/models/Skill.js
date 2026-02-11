import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";
class Skill extends Model {
}
Skill.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    iconLibrary: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    tableName: "skills",
    timestamps: false
});
export default Skill;
