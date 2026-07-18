'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      phone_number: {
        type: Sequelize.STRING(15),
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      fullname: Sequelize.STRING(100),
      role: {
        type: Sequelize.ENUM('admin', 'operator', 'umum'),
      },
      villageId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      device: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};
