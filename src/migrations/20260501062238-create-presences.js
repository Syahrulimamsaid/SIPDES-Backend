'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('presences', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      locationAccessId: {
        type: Sequelize.UUID,
        references: {
          model: 'locations_access',
          key: 'id',
        },
      },
      in: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      out: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      in_lat: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      in_long: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      out_lat: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      out_long: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('hadir', 'terlambat', 'pulang', 'alpa', 'cuti'),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('presences', ['userId', 'in']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('presences');

    // penting: drop ENUM di Postgres agar tidak orphan
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_presences_status";'
    );
  },
};