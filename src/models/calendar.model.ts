import { DataTypes } from "sequelize";
import sequelize from "./index";
const Calendar = sequelize.define(
  "Calendar",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    type: DataTypes.ENUM("h", "t", "off", "fm"),
  },
  {
    tableName: "calendars",
  },
);

export default Calendar;
