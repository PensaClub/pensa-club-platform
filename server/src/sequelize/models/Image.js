'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Image extends Model {
        static associate(models) {
            const imageableModels = [
                { model: 'section', connection: 'section' },
                { model: 'downloadMaterial', connection: 'downloadMaterial' },
                { model: 'initiative', connection: 'initiative_main' },
                { model: 'initiative', connection: 'initiative_main_gallery' },
                { model: 'story', connection: 'story' },
                { model: 'publication', connection: 'publication' },
                { model: 'project', connection: 'project_main' },
                { model: 'project', connection: 'project_logo' },
                { model: 'project', connection: 'project_gallery' },
            ];

            imageableModels.forEach(({ model, connection }) => {
                Image.belongsTo(models[model], {
                    foreignKey: 'imageableId',
                    constraints: false,
                    scope: {
                        image_link_connection: connection,
                    },
                });
            });
        }
    }
    Image.init(
        {
            src: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            alt: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            caption: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            imageableId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'imageable_id',
            },
            imageLinkConnection: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'image_link_connection',
            },
            isUploading: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false,
                field: 'is_uploading',
            },
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            size: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'image',
            timestamps: true,
            underscored: true,
        }
    );
    return Image;
};
