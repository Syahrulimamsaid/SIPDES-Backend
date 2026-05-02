export default (sequelize:any, DataTypes:any) => {
  return sequelize.define("Location", {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: DataTypes.STRING,
    lat: DataTypes.DECIMAL(10, 8),
    lng: DataTypes.DECIMAL(11, 8),
    radius: DataTypes.INTEGER,
    villageId: DataTypes.UUID,
  }, {
    tableName: "locations",
  });
};