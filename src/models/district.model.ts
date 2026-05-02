export default (sequelize:any, DataTypes:any) => {
  return sequelize.define("District", {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: DataTypes.STRING,
  }, {
    tableName: "districts",
  });
};