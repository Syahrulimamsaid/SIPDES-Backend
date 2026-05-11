import { DataTypes } from "sequelize";
import sequelize from "../application/database";

import UserModel from "./user.model";
import VillageModel from "./village.model";
import PresenceModel from "./presence.model";
import LocationModel from "./location.model";
import LocationAccessModel from "./location-access.model";
import DistrictModel from "./sub-district.model";
import CalendarModel from "./calendar.model";
import SettingModel from "./setting.model";

const User = UserModel(sequelize, DataTypes);
const Village = VillageModel(sequelize, DataTypes);
const Presence = PresenceModel(sequelize, DataTypes);
const Location = LocationModel(sequelize, DataTypes);
const LocationAccess = LocationAccessModel(sequelize, DataTypes);
const SubDistrict = DistrictModel(sequelize, DataTypes);
const Calendar = CalendarModel(sequelize, DataTypes);
const Setting = SettingModel(sequelize, DataTypes);

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
Presence.belongsTo(LocationAccess, { foreignKey: "locationAccessId" });

Location.belongsTo(Village, { foreignKey: "villageId" });
LocationAccess.hasMany(Presence, { foreignKey: "locationAccessId" });
Location.belongsToMany(User, {
  through: LocationAccess,
  foreignKey: "locationId",
  otherKey: "userId",
});

LocationAccess.belongsTo(User, { foreignKey: "userId" });
LocationAccess.belongsTo(Location, { foreignKey: "locationId" });

SubDistrict.hasMany(Village, { foreignKey: "subDistrictId" });

Village.belongsTo(SubDistrict, { foreignKey: "subDistrictId" });

export {
  sequelize,
  User,
  Village,
  Presence,
  Location,
  LocationAccess,
  SubDistrict,
  Calendar,
  Setting
};