'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('visit_testimonials', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },

      // ===============================
      // REFERENCE
      // ===============================
      visit_request_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'club_visit_requests',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },

      // ===============================
      // TESTIMONIAL CONTENT
      // ===============================
      club_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      quote: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      author_name: {
        type: DataTypes.STRING(200),
        allowNull: true,
        defaultValue: null,
      },
      is_approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.dropTable('visit_testimonials');
  },
};
