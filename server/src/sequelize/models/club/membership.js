'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ClubMembership extends Model {
        static associate(models) {
            ClubMembership.belongsTo(models.club_Club, {
                foreignKey: 'clubId',
                as: 'membershipClub',
                onDelete: 'CASCADE',
            });
        }

        toJSON() {
            const values = { ...this.get() };
            if (values.id) {
                values.id = values.id.toString();
            }
            return values;
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
            },
            totalMembers: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                field: 'total_members',
            },
            maxMembers: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                field: 'max_members',
            },
            ageGroups: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                field: 'age_groups',
            },
            membershipFee: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                field: 'membership_fee',
            },
            type: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            minimumAge: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                field: 'minimum_age',
            },
            trialPeriod: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                field: 'trial_period',
            },
            fees: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
            },
            management: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
            },
            requirements: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            benefits: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
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
