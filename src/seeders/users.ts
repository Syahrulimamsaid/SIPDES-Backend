'use strict';

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export default {
  async up(queryInterface:any) {
    const villages = await queryInterface.sequelize.query(
      `SELECT id FROM villages LIMIT 2;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        phone_number: '085886859759',
        password: await bcrypt.hash('123456', 10),
        fullname: 'Admin User',
        role: 'admin',
        villageId: villages[0].id,
        device: 'web',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        phone_number: '082222222222',
        password: await bcrypt.hash('123456', 10),
        fullname: 'Operator User',
        role: 'operator',
        villageId: villages[1].id,
        device: 'mobile',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface:any) {
    await queryInterface.bulkDelete('users', null, {});
  },
};