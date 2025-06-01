'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Image extends Model {
        static associate(models) {
            const imageableModels = [
                { model: 'section', connection: 'section' },
                { model: 'publishedContent', connection: 'publishedContent' },
                { model: 'downloadMaterials', connection: 'downloadMaterials' },
                { model: 'initiative', connection: 'initiative' },
            ];

            imageableModels.forEach(({ model, connection }) => {
                Image.belongsTo(models[model], {
                    foreignKey: 'imageableId',
                    constraints: false,
                    scope: {
                        imageLinkConnection: connection,
                    },
                });
            });
        }
    }
    Image.init(
        {
            src: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            alt: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            caption: {
                type: DataTypes.STRING,
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
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'image',
        }
    );
    return Image;
};
