export default (sequelize:any, DataTypes:any) => {
  return sequelize.define("Village", {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    districtId: DataTypes.UUID,
  }, {
    tableName: "villages",
  });
};