'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('mentor_applications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user_accounts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Name is required.',
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: {
            msg: 'Email format is incorrect.',
          },
          notEmpty: {
            msg: 'Email is required.',
          },
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Phone is required.',
          },
        },
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: {
            args: [18],
            msg: 'Age must be at least 18.',
          },
          max: {
            args: [100],
            msg: 'Age must be less than 100.',
          },
        },
      },
      education: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      specialization: {
        type: DataTypes.STRING,
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
        validate: {
          isIn: {
            args: [['email', 'phone', 'viber', 'facebook', 'linkedin', 'other']],
            msg: 'Priority contact must be one of: email, phone, viber, facebook, linkedin, other',
          },
        },
      },
      photo_url: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: null,
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
      cv_storage_path: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: {
            args: [['pending', 'approved', 'rejected']],
            msg: 'Status must be one of: pending, approved, rejected',
          },
        },
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      rejected_at: {
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
    await queryInterface.dropTable('mentor_applications');
  },
};