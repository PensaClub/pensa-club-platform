'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class drive_folder_password extends Model {
        static associate(models) {
            drive_folder_password.belongsTo(models.user_account, {
                foreignKey: 'createdBy',
                targetKey: 'id',
                as: 'creator',
            });
        }
    }

    drive_folder_password.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            folderId: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                field: 'folder_id',
            },
            folderName: {
                type: DataTypes.STRING(500),
                allowNull: false,
                field: 'folder_name',
            },
            passwordHash: {
                type: DataTypes.STRING(255),
                allowNull: false,
                field: 'password_hash',
            },
            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'created_by',
            },
            lockTimeout: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
                field: 'lock_timeout',
            },
        },
        {
            sequelize,
            modelName: 'drive_folder_password',
            tableName: 'drive_folder_passwords',
            underscored: true,
        }
    );

    return drive_folder_password;
};
