'use strict';

import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface:any) {
    const subDistrictId = uuidv4();

    await queryInterface.bulkInsert('sub_districts', [
      {
        id: subDistrictId,
        name: 'Pati',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface:any) {
    await queryInterface.bulkDelete('sub_districts', null, {});
  },
};