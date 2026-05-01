'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('locations', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: Sequelize.STRING(100),
      lat: Sequelize.DECIMAL(10, 8),
      lng: Sequelize.DECIMAL(11, 8),
      radius: Sequelize.INTEGER,
      villageId: {
        type: Sequelize.UUID,
        references: {
          model: 'villages',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('locations');
  },
};