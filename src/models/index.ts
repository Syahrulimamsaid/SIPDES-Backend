import { DataTypes } from "sequelize";
import sequelize from "../application/database";

import UserModel from "./user.model";
import VillageModel from "./village.model";
import PresenceModel from "./presence.model";
import LocationModel from "./location.model";
import LocationAccessModel from "./location-access.model";
import DistrictModel from "./district.model";
import CalendarModel from "./calendar.model";

const User = UserModel(sequelize, DataTypes);
const Village = VillageModel(sequelize, DataTypes);
const Presence = PresenceModel(sequelize, DataTypes);
const Location = LocationModel(sequelize, DataTypes);
const LocationAccess = LocationAccessModel(sequelize, DataTypes);
const District = DistrictModel(sequelize, DataTypes);
const Calendar = CalendarModel(sequelize, DataTypes);

User.belongsTo(Village, { foreignKey: "villageId" });
User.hasMany(Presence, { foreignKey: "userId" });
User.belongsToMany(Location, {
  through: LocationAccess,
  foreignKey: "userId",
  otherKey: "locationId",
});

Village.hasMany(User, { foreignKey: "villageId" });
Village.hasMany(Location, { foreignKey: "villageId" });

Presence.belongsTo(User, { foreignKey: "userId" });
Presence.belongsTo(Location, { foreignKey: "locationId" });

Location.belongsTo(Village, { foreignKey: "villageId" });
Location.hasMany(Presence, { foreignKey: "locationId" });
Location.belongsToMany(User, {
  through: LocationAccess,
  foreignKey: "locationId",
  otherKey: "userId",
});

LocationAccess.belongsTo(User, { foreignKey: "userId" });
LocationAccess.belongsTo(Location, { foreignKey: "locationId" });

District.hasMany(Village, { foreignKey: "districtId" });

Village.belongsTo(District, { foreignKey: "districtId" });

export {
  sequelize,
  User,
  Village,
  Presence,
  Location,
  LocationAccess,
  District,
  Calendar,
};