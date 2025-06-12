'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class DownloadMaterial extends Model {
        static associate(models) {
            DownloadMaterial.belongsTo(models.initiative, {
                foreignKey: 'downloadableId',
                constraints: false,
                scope: {
                    download_link_connection: 'initiative',
                },
            });

            DownloadMaterial.belongsTo(models.project, {
                foreignKey: 'downloadableId',
                constraints: false,
                scope: {
                    download_link_connection: 'project',
                },
            });

            DownloadMaterial.belongsTo(models.story, {
                foreignKey: 'downloadableId',
                constraints: false,
                scope: {
                    download_link_connection: 'story',
                },
            });

            DownloadMaterial.belongsTo(models.publication, {
                foreignKey: 'downloadableId',
                constraints: false,
                scope: {
                    download_link_connection: 'publication',
                },
            });

            DownloadMaterial.hasOne(models.image, {
                as: 'image',
                foreignKey: 'imageableId',
                constraints: false,
                scope: {
                    image_link_connection: 'downloadMaterial',
                },
            });
        }
    }
    DownloadMaterial.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            titleSlug: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'title_slug',
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            fileType: {
                type: DataTypes.ENUM('pdf', 'docx'),
                allowNull: false,
                field: 'file_type',
            },
            fileSize: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                field: 'file_size',
                get() {
                    const size = this.getDataValue('fileSize');
                    return size ? `${size} MB` : null;
                },
            },
            downloadUrl: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'download_url',
            },
            downloadableId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'downloadable_id',
            },
            downloadLinkConnection: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'download_link_connection',
            },
        },
        {
            sequelize,
            modelName: 'downloadMaterial',
        }
    );
    return DownloadMaterial;
};
