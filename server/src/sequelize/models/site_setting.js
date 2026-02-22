'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class site_setting extends Model {
        static associate(models) {
            // No associations needed
        }
    }

    site_setting.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            key: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            value: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'false',
            },
            type: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: 'boolean',
            },
            category: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: 'general',
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'site_setting',
            tableName: 'site_settings',
            underscored: true,
        }
    );

    return site_setting;
};
