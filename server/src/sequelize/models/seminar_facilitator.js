'use strict';
const { Model } = require('sequelize');

/**
 * A seminar_facilitator row links a seminar to ONE of three kinds of
 * facilitator: a mentor, an admin user, or an external lecturer. Exactly
 * one of the three FK columns is populated per row (enforced by a DB
 * CHECK constraint).
 *
 * Personal mentor statistics (activity snapshots, rating, history) apply
 * ONLY when facilitator_type='mentor'. Aggregate statistics (partner-facing
 * reports, admin library, search filters) apply to ALL three types.
 */
module.exports = (sequelize, DataTypes) => {
    class seminar_facilitator extends Model {
        static associate(models) {
            seminar_facilitator.belongsTo(models.seminar, {
                foreignKey: 'seminarId',
                targetKey: 'id',
                as: 'seminar',
                onDelete: 'CASCADE',
            });

            seminar_facilitator.belongsTo(models.mentor, {
                foreignKey: 'mentorId',
                targetKey: 'id',
                as: 'mentor',
            });

            seminar_facilitator.belongsTo(models.user_account, {
                foreignKey: 'adminUserId',
                targetKey: 'id',
                as: 'adminUser',
            });

            seminar_facilitator.belongsTo(models.external_lecturer, {
                foreignKey: 'externalLecturerId',
                targetKey: 'id',
                as: 'externalLecturer',
            });
        }
    }

    seminar_facilitator.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            seminarId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'seminar_id',
            },
            facilitatorType: {
                type: DataTypes.STRING(20),
                allowNull: false,
                field: 'facilitator_type',
                validate: {
                    isIn: [['mentor', 'admin', 'external']],
                },
            },
            mentorId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'mentor_id',
            },
            adminUserId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'admin_user_id',
            },
            externalLecturerId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'external_lecturer_id',
            },
            role: {
                type: DataTypes.STRING(30),
                allowNull: false,
                defaultValue: 'mentor',
                validate: {
                    isIn: [['lecturer', 'mentor', 'assistant', 'guest']],
                },
            },
            isLead: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_lead',
            },
            sortOrder: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'sort_order',
            },
        },
        {
            sequelize,
            modelName: 'seminar_facilitator',
            tableName: 'seminar_facilitators',
            underscored: true,
            timestamps: true,
        }
    );

    return seminar_facilitator;
};
