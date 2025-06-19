'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class sponsor extends Model {
        static associate(models) {
            sponsor.belongsTo(models.initiative, {
                foreignKey: 'sponsorableId',
                constraints: false,
                scope: {
                    sponsor_link_connection: 'initiative',
                },
            });

            sponsor.belongsTo(models.project, {
                foreignKey: 'sponsorableId',
                constraints: false,
                scope: {
                    sponsor_link_connection: 'project',
                },
            });
        }
    }
    sponsor.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            amount: {
                type: DataTypes.DECIMAL(20, 2),
                allowNull: true,
            },
            currency: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            type: {
                type: DataTypes.STRING,
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
            website: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            sponsorableId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'sponsorable_id',
            },
            sponsorLinkConnection: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'sponsor_link_connection',
            },
        },
        {
            sequelize,
            modelName: 'sponsor',
            timestamps: true,
            underscored: true,
        }
    );
    return sponsor;
};
