'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('reaction_gallery_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },

      // ===============================
      // MEDIA
      // ===============================
      media_type: {
        type: DataTypes.ENUM('image', 'video'),
        allowNull: false,
      },
      media_url: {
        type: DataTypes.STRING(2048),
        allowNull: false,
      },
      thumbnail_url: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: null,
      },

      // ===============================
      // METADATA
      // ===============================
      title: {
        type: DataTypes.STRING(200),
        allowNull: true,
        defaultValue: null,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_published: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      // ===============================
      // REFERENCE
      // ===============================
      uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'user_accounts',
          key: 'id',
        },
        onDelete: 'SET NULL',
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

    await queryInterface.addIndex('reaction_gallery_items', ['is_published', 'sort_order']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reaction_gallery_items');
  },
};
