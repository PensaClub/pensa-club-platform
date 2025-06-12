'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Milestone extends Model {
        static associate(models) {
            Milestone.belongsTo(models.project, {
                foreignKey: 'projectId',
                as: 'project',
            });
        }
    }

    Milestone.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            dueDate: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'due_date',
            },
            status: {
                type: DataTypes.ENUM('pending', 'in-progress', 'completed', 'delayed'),
                allowNull: true,
                defaultValue: 'pending',
            },
            order: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
            },
            projectId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'projects',
                    key: 'id',
                },
                field: 'project_id',
                onDelete: 'CASCADE',
            },
        },
        {
            sequelize,
            modelName: 'milestone',
            timestamps: true,
        }
    );

    return Milestone;
};
