export default (sequelize:any, DataTypes:any) => {
  return sequelize.define("Settings", {
    id: { type: DataTypes.UUID, primaryKey: true },
    in_time: DataTypes.TIME,
    out_time: DataTypes.TIME,
  }, {
    tableName: "settings",
  });
};