'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class presentation extends Model {
    static associate(models) {
      // Belongs to course
      presentation.belongsTo(models.course, {
        foreignKey: 'courseId',
        targetKey: 'id',
        as: 'course',
      });

      // Has many student_presentations
      presentation.hasMany(models.student_presentation, {
        foreignKey: 'presentationId',
        sourceKey: 'id',
        as: 'submissions',
      });

      // Belongs to creator
      presentation.belongsTo(models.user_account, {
        foreignKey: 'createdBy',
        targetKey: 'id',
        as: 'creator',
      });
    }
  }

  presentation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'course_id',
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'due_date',
      },
      maxCredits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'max_credits',
      },
      submissionType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'file',
        field: 'submission_type',
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'created_by',
      },
    },
    {
      sequelize,
      modelName: 'presentation',
      tableName: 'presentations',
      underscored: true,
    }
  );

  return presentation;
};