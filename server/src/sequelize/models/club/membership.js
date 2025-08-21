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
                unique: true,
            },
            totalMembers: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                field: 'total_members',
            },
            ageGroups: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Age group distribution: {"below-60": 0, "60-70": 0, "70-80": 0, "80+": 0}',
            },
            membershipFee: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Membership fees: {"monthly": 0, "yearly": 0, "currency": "BGN"}',
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
        },
        {
            sequelize,
            modelName: 'ClubMembership',
            tableName: 'club_membership',
            timestamps: true,
            underscored: true,
        }
    );

    return ClubMembership;
};
