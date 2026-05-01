import { DataTypes } from "sequelize";
import sequelize from "./index";
const Village = sequelize.define(
  "Village",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    districtId: DataTypes.UUID,
  },
  {
    tableName: "villages",
  },
);

Village.associate = (models:any) => {
  Village.belongsTo(models.District, { foreignKey: "districtId" });

  Village.hasMany(models.User, { foreignKey: "villageId" });

  Village.hasMany(models.Location, { foreignKey: "villageId" });
};

export default Village;
