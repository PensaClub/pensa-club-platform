'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ClubMembership extends Model {
        static associate(models) {
            ClubMembership.belongsTo(models.Club, {
                foreignKey: 'clubId',
                as: 'club',
                onDelete: 'CASCADE',
            });
        }
    }

    ClubMembership.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            clubId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'club_id',
                references: {
                    model: 'clubs',
                    key: 'id',
                },
                unique: true,
            },
            totalMembers: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                field: 'total_members',
                comment: 'Maximum allowed members - 0 means unlimited',
            },
            ageGroups: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Age group distribution: {"60-70": 0, "70-80": 0, "80+": 0}',
            },
            membershipFee: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Fee structure: {monthly: number, yearly: number, currency: string}',
            },
            requirements: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
                comment: 'Array of membership requirements',
            },
            benefits: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
                comment: 'Array of membership benefits',
            },
            applicationProcess: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Application process details',
            },
            membershipRules: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Club rules and policies',
            },
            renewalProcess: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Membership renewal information',
            },
            isOpenForNewMembers: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true,
                field: 'is_open_for_new_members',
            },
        },
        {
            sequelize,
            modelName: 'ClubMembership',
            tableName: 'club_memberships',
            timestamps: true,
            underscored: true,
        }
    );

    return ClubMembership;
};
