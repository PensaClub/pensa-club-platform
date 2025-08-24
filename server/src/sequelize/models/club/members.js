'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ClubMember extends Model {
        static associate(models) {
            ClubMember.belongsTo(models.club_Club, {
                foreignKey: 'clubId',
                as: 'memberClub',
                onDelete: 'CASCADE',
            });
        }

        toJSON() {
            const values = { ...this.get() };
            if (values.id) {
                values.id = values.id.toString();
            }
            if (values.clubId) {
                values.clubId = values.clubId.toString();
            }
            if (values.userId) {
                values.userId = values.userId.toString();
            }
            return values;
        }
    }

    ClubMember.init(
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
            firstName: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'first_name',
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'last_name',
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            photo: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Member photo: {"src": "", "alt": ""}',
            },
            joinDate: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'join_date',
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true,
                field: 'is_active',
            },
            role: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Member role in the club',
            },
        },
        {
            sequelize,
            modelName: 'ClubMember',
            tableName: 'club_members',
            timestamps: true,
            underscored: true,
        }
    );

    return ClubMember;
};
