import { DataTypes } from "sequelize";
import sequelize from "./index";
const Location = sequelize.define(
  "Location",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    lat: DataTypes.DECIMAL(10, 8),
    lng: DataTypes.DECIMAL(11, 8),
    radius: DataTypes.INTEGER,
    villageId: DataTypes.UUID,
  },
  {
    tableName: "locations",
  },
);

Location.associate = (models: any) => {
  Location.belongsTo(models.Village, { foreignKey: "villageId" });

  Location.hasMany(models.Presence, { foreignKey: "locationId" });

  Location.belongsToMany(models.User, {
    through: models.LocationAccess,
    foreignKey: "locationId",
    otherKey: "userId",
  });
};

export default Location;
