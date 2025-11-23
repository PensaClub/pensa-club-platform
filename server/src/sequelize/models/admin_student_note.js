// server/sequelize/models/admin_student_note.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class admin_student_note extends Model {
    static associate(models) {
      // Belongs to student
      admin_student_note.belongsTo(models.student, {
        foreignKey: 'studentId',
        targetKey: 'id',
        as: 'student'
      });
    }
  }

  admin_student_note.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
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
      }
    },
    {
      sequelize,
      modelName: 'admin_student_note',
      tableName: 'admin_student_notes',
      underscored: true
    }
  );

  return admin_student_note;
};