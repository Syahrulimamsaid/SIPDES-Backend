import { DataTypes } from "sequelize";
import sequelize from "./index";  const Presence = sequelize.define('Presence', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: DataTypes.UUID,
    locationId: DataTypes.UUID,
    in: DataTypes.DATE,
    out: DataTypes.DATE,
    in_lat: DataTypes.DECIMAL(10, 8),
    in_long: DataTypes.DECIMAL(11, 8),
    out_lat: DataTypes.DECIMAL(10, 8),
    out_long: DataTypes.DECIMAL(11, 8),
    status: DataTypes.ENUM('hadir', 'terlambat', 'alpa', 'cuti'),
  }, {
    tableName: 'presences',
  });

  Presence.associate = (models:any) => {
    Presence.belongsTo(models.User, { foreignKey: 'userId' });

    Presence.belongsTo(models.Location, { foreignKey: 'locationId' });
  };


export default Presence;
