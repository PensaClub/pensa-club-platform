'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class client_error_log extends Model {
        static associate(models) {
            // No associations needed
        }
    }

    client_error_log.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            error_message: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            error_stack: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            component_stack: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            url: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            user_agent: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            ip_address: {
                type: DataTypes.STRING(45),
                allowNull: true,
            },
            extra_info: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'client_error_log',
            tableName: 'client_error_logs',
            underscored: true,
            timestamps: true,
        }
    );

    return client_error_log;
};
