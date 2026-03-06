// server/sequelize/models/mentor_application.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class mentor_application extends Model {
    static associate(models) {
      // Belongs to user account
      mentor_application.belongsTo(models.user_account, {
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'user',
      });

      // Has one mentor (when approved)
      mentor_application.hasOne(models.mentor, {
        foreignKey: 'applicationId',
        sourceKey: 'id',
        as: 'mentor',
      });
    }
  }

  mentor_application.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'user_accounts',
          key: 'id',
        },
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
      country: {
  type: DataTypes.STRING(5),
  allowNull: true,
  defaultValue: 'BG',
  validate: {
    isIn: {
      args: [['BG', 'DE', 'AT', 'GR', 'RO', 'RS', 'MK', 'TR', 'IT', 'FR', 'ES', 'PT', 'NL', 'BE', 'PL', 'CZ', 'SK', 'HU', 'HR', 'SI', 'CY', 'CH', 'GB', 'US', 'UA', 'MD', 'OTHER']],
      msg: 'Country must be a valid country code'
    }
  }
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
        validate: {
          isArray(value) {
            if (value !== null && !Array.isArray(value)) {
              throw new Error('Languages must be an array of strings.');
            }
          },
        },
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
      otherContact: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        field: 'other_contact',
      },
      priorityContact: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'email',
        field: 'priority_contact',
        validate: {
          isIn: {
            args: [['email', 'phone', 'viber', 'facebook', 'linkedin', 'other']],
            msg: 'Priority contact must be one of: email, phone, viber, facebook, linkedin, other',
          },
        },
      },
      photoUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: null,
        field: 'photo_url',
      },
      cvUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        defaultValue: null,
        field: 'cv_url',
      },
      cvOriginalName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        field: 'cv_original_name',
      },
      cvStoragePath: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        field: 'cv_storage_path',
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
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        field: 'rejection_reason',
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'approved_at',
      },
      rejectedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'rejected_at',
      },
    },
    {
      sequelize,
      modelName: 'mentor_application',
      tableName: 'mentor_applications',
    }
  );

  return mentor_application;
};