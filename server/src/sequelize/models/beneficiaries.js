'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class beneficiaries extends Model {
        static associate(models) {
            beneficiaries.belongsTo(models.project, {
                foreignKey: 'projectId',
                as: 'project',
            });
        }
    }

    beneficiaries.init(
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
                references: {
                    model: 'projects',
                    key: 'id',
                },
                field: 'project_id',
                onDelete: 'CASCADE',
            },
            totalCount: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                field: 'total_count',
            },
            totalAmountDistributed: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: true,
                defaultValue: 0.0,
                field: 'total_amount_distributed',
                get() {
                    const value = this.getDataValue('totalAmountDistributed');
                    return value ? parseFloat(value) : 0;
                },
            },
            currency: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: 'BGN',
            },
            list: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
            },
        },
        {
            sequelize,
            modelName: 'beneficiaries',
            timestamps: true,
            underscored: true,
        }
    );

    return beneficiaries;
};
