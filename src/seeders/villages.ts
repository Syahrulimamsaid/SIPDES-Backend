'use strict';

import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface:any) {
    const district = await queryInterface.sequelize.query(
      `SELECT id FROM districts LIMIT 1;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const districtId = district[0].id;

    const villages = ['Tlogowungu', 'Margorejo', 'Juwana', 'Batangan'];

    await queryInterface.bulkInsert(
      'villages',
      villages.map((v) => ({
        id: uuidv4(),
        name: v,
        address: `${v}, Pati`,
        districtId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  },

  async down(queryInterface:any) {
    await queryInterface.bulkDelete('villages', null, {});
  },
};