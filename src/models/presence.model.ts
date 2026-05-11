export default (sequelize:any, DataTypes:any) => {
  return sequelize.define("Presence", {
    id: { type: DataTypes.UUID, primaryKey: true },
    userId: DataTypes.UUID,
    locationAccessId: DataTypes.UUID,
    in: DataTypes.DATE,
    out: DataTypes.DATE,
    in_lat: DataTypes.DECIMAL(10, 8),
    in_long: DataTypes.DECIMAL(11, 8),
    out_lat: DataTypes.DECIMAL(10, 8),
    out_long: DataTypes.DECIMAL(11, 8),
    status: DataTypes.ENUM('hadir', 'terlambat', 'pulang', 'alpa', 'cuti'),
  }, {
    tableName: "presences",
  });
};