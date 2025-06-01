'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class downloadMaterials extends Model {
        static associate(models) {
            downloadMaterials.belongsTo(models.initiative, {
                foreignKey: 'initiativeId',
            });

            downloadMaterials.hasOne(models.image, {
                as: 'image',
                foreignKey: 'imageableId',
                constraints: false,
                scope: {
                    imageLinkConnection: 'downloadMaterials',
                },
            });
        }
    }
    downloadMaterials.init(
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
            },
        },
        {
            sequelize,
            modelName: 'downloadMaterials',
        }
    );
    return downloadMaterials;
};
