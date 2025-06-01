'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class projects extends Model {
        static associate(models) {
            projects.belongsTo(models.initiative, {
                foreignKey: 'initiativeId',
            });
        }
    }
    projects.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            'title-slug': {
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
                type: DataTypes.ENUM('in-progress', 'active', 'planned'),
                allowNull: false,
                defaultValue: 'in-progress',
                validate: {
                    isIn: {
                        args: ['in-progress', 'active', 'planned'],
                        msg: 'Status must be in-progress, active or planned',
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
        },
        {
            sequelize,
            modelName: 'projects',
        }
    );
    return projects;
};
