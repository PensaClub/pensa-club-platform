'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('mentor_availabilities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },

      // ===============================
      // MENTOR REFERENCE
      // ===============================
      mentor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'mentors',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      // ===============================
      // AVAILABILITY
      // ===============================
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      // ===============================
      // TIMESTAMPS
      // ===============================
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });

    // ===============================
    // UNIQUE CONSTRAINT
    // ===============================
    await queryInterface.addConstraint('mentor_availabilities', {
      fields: ['mentor_id', 'date'],
      type: 'unique',
      name: 'uq_mentor_availabilities_mentor_date',
    });
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('mentor_availabilities');
  },
};
