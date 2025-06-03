'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Project extends Model {
        static associate(models) {
            Project.belongsTo(models.initiative, {
                foreignKey: 'initiativeId',
            });
        }
    }
    Project.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            titleSlug: {
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
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('in-progress', 'active', 'planned', 'completed'),
                allowNull: false,
                defaultValue: 'in-progress',
                validate: {
                    isIn: {
                        args: ['in-progress', 'active', 'planned', 'completed'],
                        msg: 'Status must be in-progress, active, planned or completed',
                    },
                },
            },
            image: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            link: {
                type: DataTypes.STRING,
                allowNull: true,
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
            lat: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            lng: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'project',
        }
    );
    return Project;
};
