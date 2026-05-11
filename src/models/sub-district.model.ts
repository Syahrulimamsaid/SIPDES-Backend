export default (sequelize:any, DataTypes:any) => {
  return sequelize.define("SubDistrict", {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: DataTypes.STRING,
  }, {
    tableName: "sub_districts",
  });
};