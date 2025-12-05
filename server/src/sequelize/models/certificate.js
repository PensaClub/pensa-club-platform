// server/src/sequelize/models/certificate.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class certificate extends Model {
    static associate(models) {
      certificate.belongsTo(models.student, {
        foreignKey: 'studentId',
        targetKey: 'id',
        as: 'student',
      });

      certificate.belongsTo(models.course, {
        foreignKey: 'courseId',
        targetKey: 'id',
        as: 'course',
      });

      certificate.belongsTo(models.user_account, {
        foreignKey: 'issuedBy',
        targetKey: 'id',
        as: 'issuer',
      });
    }
  }

  certificate.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'student_id',
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'course_id',
      },
      issuedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'issued_by',
      },
      certificateNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'certificate_number',
      },
      studentName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'student_name',
      },
      courseTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'course_title',
      },
      courseCategory: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'course_category',
      },
      completionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'completion_date',
      },
      finalScore: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'final_score',
      },
      totalCreditsEarned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_credits_earned',
      },
      totalHoursCompleted: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'total_hours_completed',
      },
      pdfUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: 'pdf_url',
      },
      validationCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'validation_code',
      },
      validUntil: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'valid_until',
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'revoked_at',
      },
      revokedReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'revoked_reason',
      },
      additionalInfo: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
        field: 'additional_info',
      },
      issuedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'issued_at',
      },
    },
    {
      sequelize,
      modelName: 'certificate',
      tableName: 'certificates',
      timestamps: true,
      underscored: true,
    }
  );

  return certificate;
};