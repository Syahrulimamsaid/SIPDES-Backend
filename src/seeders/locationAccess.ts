"use strict";

import { v4 as uuidv4 } from "uuid";

export default {
  async up(queryInterface: any) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const locations = await queryInterface.sequelize.query(
      `SELECT id, name FROM locations LIMIT 5;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    if (!users.length) {
      throw new Error("Seeder users belum ada datanya");
    }

    if (!locations.length) {
      throw new Error("Seeder locations belum ada datanya");
    }

    const access = [];

    for (let i = 0; i < locations.length; i++) {
      const user = users[1];
      const location = locations[i];

      access.push({
        id: uuidv4(),
        userId: user.id,
        locationId: location.id,
        description: `Akses ke ${location.name}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert("locations_access", access);
  },

  async down(queryInterface: any) {
    await queryInterface.bulkDelete("locations_access", null, {});
  },
};