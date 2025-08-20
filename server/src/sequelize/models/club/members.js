'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ClubMember extends Model {
        static associate(models) {
            ClubMember.belongsTo(models.Club, {
                foreignKey: 'clubId',
                as: 'club',
                onDelete: 'CASCADE',
            });

            ClubMember.belongsTo(models.user_account, {
                foreignKey: 'userId',
                as: 'user',
                onDelete: 'CASCADE',
            });
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
                references: {
                    model: 'clubs',
                    key: 'id',
                },
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
                references: {
                    model: 'user_accounts',
                    key: 'id',
                },
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
                type: DataTypes.STRING,
                allowNull: true,
            },
            photo: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Photo info: {url, alt, caption}',
            },
            joinDate: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'join_date',
            },
            role: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Member role in club - validated by app schema',
            },
            status: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: 'active',
                comment: 'Member status - validated by app schema',
            },
            preferences: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Member preferences and settings',
            },
        },
        {
            sequelize,
            modelName: 'ClubMember',
            tableName: 'club_members',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    unique: true,
                    fields: ['club_id', 'user_id'],
                    name: 'club_members_club_user_unique',
                },
            ],
        }
    );

    return ClubMember;
};
