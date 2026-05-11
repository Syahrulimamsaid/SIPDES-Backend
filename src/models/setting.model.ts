export default (sequelize:any, DataTypes:any) => {
  return sequelize.define("Settings", {
    id: { type: DataTypes.UUID, primaryKey: true },
    in_time: DataTypes.DATE,
    out_time: DataTypes.DATE,
  }, {
    tableName: "settings",
  });
};