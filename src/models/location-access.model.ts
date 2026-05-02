export default (sequelize:any, DataTypes:any) => {
  return sequelize.define("LocationAccess", {
    id: { type: DataTypes.UUID, primaryKey: true },
    userId: DataTypes.UUID,
    locationId: DataTypes.UUID,
    description: DataTypes.TEXT,
  }, {
    tableName: "locations_access",
  });
};