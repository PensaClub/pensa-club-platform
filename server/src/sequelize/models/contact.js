'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Contact extends Model {
        static associate(models) {
            Contact.belongsTo(models.initiative, {
                foreignKey: 'initiativeId',
            });
        }
    }
    Contact.init(
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
            modelName: 'contact',
        }
    );
    return Contact;
};
