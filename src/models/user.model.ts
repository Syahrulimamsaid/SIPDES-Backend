import { DataTypes } from "sequelize";
import sequelize from "./index";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    nik_nip: DataTypes.STRING,
    password: DataTypes.STRING,
    fullname: DataTypes.STRING,
    role: DataTypes.ENUM("admin", "operator", "umum"),
    villageId: DataTypes.UUID,
    device: DataTypes.TEXT,
  },
  {
    tableName: "users",
  },
);

User.associate = (models: any) => {
  User.belongsTo(models.Village, { foreignKey: "villageId" });

  User.hasMany(models.Presence, { foreignKey: "userId" });

  User.belongsToMany(models.Location, {
    through: models.LocationAccess,
    foreignKey: "userId",
    otherKey: "locationId",
  });
};

export default User;