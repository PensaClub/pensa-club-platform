// server/src/sequelize/models/mentor_lecture.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class mentor_lecture extends Model {
    static associate(models) {
      // НОВО — Belongs to mentor
      mentor_lecture.belongsTo(models.mentor, {
        foreignKey: 'mentorId',
        targetKey: 'id',
        as: 'mentor',
      });

      // НОВО — Belongs to lecture
      mentor_lecture.belongsTo(models.lecture, {
        foreignKey: 'lectureId',
        targetKey: 'id',
        as: 'lecture',
      });
    }
  }

  mentor_lecture.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      mentorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'mentor_id',
        references: {
          model: 'mentors',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      lectureId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'lecture_id',
        references: {
          model: 'lectures',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'lecturer',
        // lecturer, mentor, assistant, guest
      },
      isLead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_lead',
      },
    },
    {
      sequelize,
      modelName: 'mentor_lecture',
      tableName: 'mentor_lectures',
      timestamps: true,
      underscored: true,
    }
  );

  return mentor_lecture;
};