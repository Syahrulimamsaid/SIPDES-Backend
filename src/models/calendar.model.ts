export default (sequelize:any, DataTypes:any) => {
  return sequelize.define("Calendar", {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    type: DataTypes.ENUM("h", "t", "off", "fm"),
  }, {
    tableName: "calendars",
  });
};