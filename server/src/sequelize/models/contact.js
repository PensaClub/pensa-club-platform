'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Contact extends Model {
        static associate(models) {
            const contactableModels = [
                { model: 'initiative', connection: 'initiative_contact' },
                { model: 'initiative', connection: 'initiative_responsible' },
                { model: 'initiative', connection: 'initiative_additional' },
                { model: 'project', connection: 'project' },
                { model: 'story', connection: 'story' },
                { model: 'publication', connection: 'publication' },
            ];

            contactableModels.forEach(({ model, connection }) => {
                Contact.belongsTo(models[model], {
                    foreignKey: 'contactableId',
                    constraints: false,
                    scope: {
                        contact_link_connection: connection,
                    },
                });
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
                type: DataTypes.TEXT,
                allowNull: true,
            },
            position: {
                type: DataTypes.TEXT,
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
                type: DataTypes.TEXT,
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
                type: DataTypes.TEXT,
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
            timestamps: true,
            underscored: true,
        }
    );
    return Contact;
};
