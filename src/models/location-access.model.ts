import { DataTypes } from "sequelize";
import sequelize from "./index";

const LocationAccess = sequelize.define(
  "LocationAccess",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: DataTypes.UUID,
    locationId: DataTypes.UUID,
    description: DataTypes.TEXT,
  },
  {
    tableName: "locations_access",
  },
);

LocationAccess.associate = (models:any) => {
  LocationAccess.belongsTo(models.User, { foreignKey: "userId" });
  LocationAccess.belongsTo(models.Location, { foreignKey: "locationId" });
};

export default LocationAccess;
