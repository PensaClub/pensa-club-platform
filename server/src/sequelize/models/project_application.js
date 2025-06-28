'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class project_application extends Model {
        static associate(models) {
            project_application.belongsTo(models.project, {
                foreignKey: 'projectId',
                as: 'project',
            });

            project_application.belongsTo(models.user_account, {
                foreignKey: 'userId',
                as: 'user',
            });
        }
    }
    project_application.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            projectId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'project_id',
                references: {
                    model: 'projects',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
                references: {
                    model: 'user_accounts',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'first_name',
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'last_name',
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            isAnonymous: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_anonymous',
            },
            status: {
                type: DataTypes.ENUM('pending', 'approved', 'rejected'),
                allowNull: false,
                defaultValue: 'pending',
            },
            appliedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                field: 'applied_at',
            },
        },
        {
            sequelize,
            modelName: 'project_application',
            tableName: 'project_applications',
            timestamps: true,
            underscored: true,
        }
    );
    return project_application;
};
