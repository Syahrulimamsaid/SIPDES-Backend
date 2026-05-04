"use strict";

import { v4 as uuidv4 } from "uuid";

export default {
  async up(queryInterface: any) {
    const villages = await queryInterface.sequelize.query(
      `SELECT id FROM villages;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const locations = [
      {
        id: uuidv4(),
        name: "Developer",
        lat: -6.810222,
        lng: 110.822208,
        radius: 100,
        villageId: villages[0 % villages.length].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Alun - Alun Kudus",
        lat: -6.807318,
        lng: 110.842,
        radius: 100,
        villageId: villages[1 % villages.length].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Salam Kebumi",
        lat: -6.791286,
        lng: 110.869325,
        radius: 100,
        villageId: villages[2 % villages.length].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Alun - Alun Pati",
        lat: -6.748448,
        lng: 111.035561,
        radius: 100,
        villageId: villages[3 % villages.length].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Kominfo Pati",
        lat: -6.738834,
        lng: 111.038347,
        radius: 100,
        villageId: villages[4 % villages.length].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("locations", locations);
  },

  async down(queryInterface: any) {
    await queryInterface.bulkDelete("locations", null, {});
  },
};
