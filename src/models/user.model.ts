export default (sequelize:any, DataTypes:any) => {
  return sequelize.define("User", {
    id: { type: DataTypes.UUID, primaryKey: true },
    phone_number: DataTypes.STRING,
    password: DataTypes.STRING,
    fullname: DataTypes.STRING,
    role: DataTypes.ENUM("admin", "operator", "umum"),
    villageId: DataTypes.UUID,
    device: DataTypes.TEXT,
  }, {
    tableName: "users",
  });
};