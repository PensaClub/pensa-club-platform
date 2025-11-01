'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('mentors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'user_accounts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      application_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'mentor_applications',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      photo_url: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: null,
      },
      specialization: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      education: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      experience: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      motivation: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      availability: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      languages: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      viber: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      facebook: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      linkedin: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      other_contact: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      priority_contact: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'email',
      },
      cv_url: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: null,
      },
      cv_original_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      is_online: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      students_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: 0.0,
          max: 5.0,
        },
      },
      sessions_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        allowNull: false,
        defaultValue: 'active',
        validate: {
          isIn: {
            args: [['active', 'inactive', 'suspended']],
            msg: 'Status must be one of: active, inactive, suspended',
          },
        },
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      last_active_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },
  
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('mentors');
  },
};