'use strict';

import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface:any) {
    await queryInterface.Insert(
      'settings',
      {
        id: uuidv4(),
        in_time: '08:00',
        out_time: '16:00',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );
  },

  async down(queryInterface:any) {
    await queryInterface.Delete('settings', null, {});
  },
};