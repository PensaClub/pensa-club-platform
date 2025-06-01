'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class contacts extends Model {
        static associate(models) {
            contacts.belongsTo(models.initiative, {
                foreignKey: 'initiativeId',
            });
        }
    }
    contacts.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            position: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            image: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            isMainContact: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_main_contact',
            },
        },
        {
            sequelize,
            modelName: 'contacts',
        }
    );
    return contacts;
};
