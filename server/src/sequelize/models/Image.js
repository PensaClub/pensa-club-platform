'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Image extends Model {
        static associate(models) {
            const imageableModels = [
                { model: 'section', connection: 'section' },
                { model: 'downloadMaterial', connection: 'downloadMaterial' },
                { model: 'initiative', connection: 'initiative_main' },
                { model: 'initiative', connection: 'initiative_logo' },
                { model: 'initiative', connection: 'initiative_gallery' },
                { model: 'story', connection: 'story' },
                { model: 'publication', connection: 'publication' },
                { model: 'sponsor', connection: 'sponsor' },
                { model: 'partner', connection: 'partner' },
                { model: 'project', connection: 'project_main' },
                { model: 'project', connection: 'project_logo' },
            ];

            imageableModels.forEach(({ model, connection }) => {
                Image.belongsTo(models[model], {
                    foreignKey: 'imageableId',
                    constraints: false,
                    scope: {
                        image_link_connection: connection,
                    },
                    indexHints: [{ type: 'USE', values: [`idx_image_${connection}`] }],
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
            timestamps: true,
            underscored: true,
        }
    );
    return Image;
};
