'use strict';

import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface:any) {
    await queryInterface.bulkInsert('calendars', [
      {
        id: uuidv4(),
        name: 'Hari Kerja',
        date: '2026-05-01',
        type: 'h',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Libur Nasional',
        date: '2026-05-02',
        type: 'off',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface:any) {
    await queryInterface.bulkDelete('calendars', null, {});
  },
};