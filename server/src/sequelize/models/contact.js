'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Contact extends Model {
        static associate(models) {
            Contact.belongsTo(models.initiative, {
                foreignKey: 'contactableId',
                constraints: false,
                scope: {
                    contact_link_connection: 'initiative',
                },
            });

            Contact.belongsTo(models.project, {
                foreignKey: 'contactableId',
                constraints: false,
                scope: {
                    contact_link_connection: 'project',
                },
            });

            Contact.belongsTo(models.story, {
                foreignKey: 'contactableId',
                constraints: false,
                scope: {
                    contact_link_connection: 'story',
                },
            });

            Contact.belongsTo(models.publication, {
                foreignKey: 'contactableId',
                constraints: false,
                scope: {
                    contact_link_connection: 'publication',
                },
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
            isTeamMember: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_team_member',
            },
            role: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            contactableId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'contactable_id',
            },
            contactLinkConnection: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'contact_link_connection',
            },
        },
        {
            sequelize,
            modelName: 'contact',
        }
    );
    return Contact;
};
