'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class visit_testimonial extends Model {
    static associate(models) {
      visit_testimonial.belongsTo(models.club_visit_request, {
        foreignKey: 'visitRequestId',
        targetKey: 'id',
        as: 'visitRequest',
      });
    }
  }

  visit_testimonial.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      visitRequestId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'visit_request_id',
        references: {
          model: 'club_visit_requests',
          key: 'id',
        },
      },
      clubName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'club_name',
        validate: {
          notEmpty: { msg: 'Club name is required.' },
        },
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'City is required.' },
        },
      },
      quote: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Quote is required.' },
        },
      },
      authorName: {
        type: DataTypes.STRING(200),
        allowNull: true,
        defaultValue: null,
        field: 'author_name',
      },
      isApproved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_approved',
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'visit_testimonial',
      tableName: 'visit_testimonials',
    }
  );

  return visit_testimonial;
};
