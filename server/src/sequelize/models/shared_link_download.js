'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class shared_link_download extends Model {
        static associate(models) {
            shared_link_download.belongsTo(models.shared_link, {
                foreignKey: 'sharedLinkId',
                as: 'sharedLink',
            });
        }
    }

    shared_link_download.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            sharedLinkId: {
                type: DataTypes.UUID,
                allowNull: false,
                field: 'shared_link_id',
                references: {
                    model: 'shared_links',
                    key: 'id',
                },
            },
            ipAddress: {
                type: DataTypes.STRING(45),
                allowNull: true,
                field: 'ip_address',
            },
            userAgent: {
                type: DataTypes.STRING(500),
                allowNull: true,
                field: 'user_agent',
            },
            downloadedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                field: 'downloaded_at',
            },
        },
        {
            sequelize,
            modelName: 'shared_link_download',
            timestamps: false,
        }
    );

    return shared_link_download;
};
