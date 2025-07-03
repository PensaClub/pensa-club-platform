'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class partner extends Model {
        static associate(models) {
            partner.belongsTo(models.initiative, {
                foreignKey: 'partnerableId',
                constraints: false,
                scope: {
                    partner_link_connection: 'initiative',
                },
            });

            partner.belongsTo(models.project, {
                foreignKey: 'partnerableId',
                constraints: false,
                scope: {
                    partner_link_connection: 'project',
                },
            });
        }
    }
    partner.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            website: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            type: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            visible: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            logo: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            partnerableId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'partnerable_id',
            },
            partnerLinkConnection: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'partner_link_connection',
            },
        },
        {
            sequelize,
            modelName: 'partner',
            timestamps: true,
            underscored: true,
        }
    );
    return partner;
};
