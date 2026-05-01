import { DataTypes } from "sequelize";
import sequelize from "./index";

const District = sequelize.define(
  "District",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: DataTypes.STRING,
  },
  {
    tableName: "districts",
  },
);

District.associate = (models:any) => {
  District.hasMany(models.Village, { foreignKey: "districtId" });
};

export default District;
