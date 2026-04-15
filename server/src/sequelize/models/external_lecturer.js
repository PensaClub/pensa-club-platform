'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class external_lecturer extends Model {
        static associate(models) {
            external_lecturer.belongsTo(models.user_account, {
                foreignKey: 'createdBy',
                targetKey: 'id',
                as: 'creator',
            });

            external_lecturer.hasMany(models.seminar_facilitator, {
                foreignKey: 'externalLecturerId',
                sourceKey: 'id',
                as: 'seminarAssignments',
            });
        }
    }

    external_lecturer.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            phone: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            organization: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            bio: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            photoUrl: {
                type: DataTypes.STRING(2048),
                allowNull: true,
                field: 'photo_url',
            },
            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'created_by',
            },
            timesUsed: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'times_used',
            },
        },
        {
            sequelize,
            modelName: 'external_lecturer',
            tableName: 'external_lecturers',
            underscored: true,
            timestamps: true,
        }
    );

    return external_lecturer;
};
