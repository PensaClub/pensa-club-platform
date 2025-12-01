// server/sequelize/models/mentor_note.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class mentor_note extends Model {
    static associate(models) {
      mentor_note.belongsTo(models.mentor, {
        foreignKey: 'mentorId',
        targetKey: 'id',
        as: 'mentor'
      });

      mentor_note.belongsTo(models.student, {
        foreignKey: 'studentId',
        targetKey: 'id',
        as: 'student'
      });
    }
  }

  mentor_note.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      mentorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'mentor_id',
        references: {
          model: 'mentors',
          key: 'id'
        }
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'student_id',
        references: {
          model: 'students',
          key: 'id'
        }
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      category: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'general',
        validate: {
          isIn: [['general', 'important', 'followup', 'positive', 'contact']]
        }
      }
    },
    {
      sequelize,
      modelName: 'mentor_note',
      tableName: 'mentor_notes',
      underscored: true
    }
  );

  return mentor_note;
};