'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class shared_link extends Model {
        static associate(models) {
            shared_link.belongsTo(models.user_account, {
                foreignKey: 'createdBy',
                as: 'creator',
            });

            shared_link.hasMany(models.shared_link_download, {
                foreignKey: 'sharedLinkId',
                as: 'downloads',
            });
        }
    }

    shared_link.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            token: {
                type: DataTypes.STRING(64),
                allowNull: false,
                unique: true,
            },
            filePath: {
                type: DataTypes.STRING(500),
                allowNull: false,
                field: 'file_path',
            },
            fileName: {
                type: DataTypes.STRING(255),
                allowNull: false,
                field: 'file_name',
            },
            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'created_by',
                references: {
                    model: 'user_accounts',
                    key: 'id',
                },
            },
            passwordHash: {
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'password_hash',
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'expires_at',
            },
            maxDownloads: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'max_downloads',
            },
            downloadCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'download_count',
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_active',
            },
        },
        {
            sequelize,
            modelName: 'shared_link',
            tableName: 'shared_links',
            underscored: true,
            timestamps: true,
        }
    );

    return shared_link;
};
