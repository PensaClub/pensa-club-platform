'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class DownloadMaterial extends Model {
        static associate(models) {
            DownloadMaterial.belongsTo(models.initiative, {
                foreignKey: 'initiativeId',
            });

            DownloadMaterial.hasOne(models.image, {
                as: 'image',
                foreignKey: 'imageableId',
                constraints: false,
                scope: {
                    imageLinkConnection: 'downloadMaterials',
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
            'title-slug': {
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
                validate: {
                    isIn: {
                        args: ['pdf', 'docx'],
                        msg: 'File type must be pdf or docx',
                    },
                },
                field: 'file_type',
            },
            fileSize: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                field: 'file_size',
                validate: {
                    min: 0,
                    msg: 'File size cant be negative',
                },
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
            initiativeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'initiatives',
                    key: 'id',
                },
                field: 'initiative_id',
            },
        },
        {
            sequelize,
            modelName: 'downloadMaterial',
        }
    );
    return DownloadMaterial;
};
