"use strict";

import { v4 as uuidv4 } from "uuid";

export default {
  async up(queryInterface: any) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const locationsAccess = await queryInterface.sequelize.query(
      `SELECT id FROM locations_access LIMIT 2;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    await queryInterface.bulkInsert("presences", [
      {
        id: uuidv4(),
        userId: users[0].id,
        locationAccessId: locationsAccess[0].id,
        in: new Date(),
        out: null,
        in_lat: -6.7,
        in_long: 111.0,
        out_lat: null,
        out_long: null,
        status: "hadir",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        userId: users[1].id,
        locationAccessId: locationsAccess[1].id,
        in: new Date(),
        out: new Date(),
        in_lat: -6.71,
        in_long: 111.01,
        out_lat: -6.72,
        out_long: 111.02,
        status: "terlambat",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface: any) {
    await queryInterface.bulkDelete("presences", null, {});
  },
};
