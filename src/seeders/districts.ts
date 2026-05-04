'use strict';

import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface:any) {
    const districtId = uuidv4();

    await queryInterface.bulkInsert('districts', [
      {
        id: districtId,
        name: 'Pati',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // simpan ke global (opsional kalau mau reuse via file)
    // global.districtId = districtId;
  },

  async down(queryInterface:any) {
    await queryInterface.bulkDelete('districts', null, {});
  },
};