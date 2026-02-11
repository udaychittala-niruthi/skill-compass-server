import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";
class Branches extends Model {
}
Branches.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    shortName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "courses",
            key: "id"
        }
    }
}, {
    sequelize,
    tableName: "branches",
    timestamps: false
});
export default Branches;
