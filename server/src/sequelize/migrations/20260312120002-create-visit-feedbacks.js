'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('visit_feedbacks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },

      // ===============================
      // REFERENCES
      // ===============================
      visit_request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'club_visit_requests',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
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
      // FEEDBACK CONTENT
      // ===============================
      participants_actual: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      topics_covered: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      challenges: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      highlights: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      recommendations: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
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
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('visit_feedbacks');
  },
};
