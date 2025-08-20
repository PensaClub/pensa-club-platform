'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ClubDetails extends Model {
        static associate(models) {
            ClubDetails.belongsTo(models.Club, {
                foreignKey: 'clubId',
                as: 'club',
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

    ClubDetails.init(
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
            fullDescription: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'full_description',
            },
            gallery: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            media: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
            },
            stats: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
            },
            management: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
            },
            contacts: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
            },
            finances: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
            },
            achievements: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
            },
            socialImpact: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                field: 'social_impact',
            },
            penClubInfo: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                field: 'pen_club_info',
            },
            preferences: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
            },
        },
        {
            sequelize,
            modelName: 'ClubDetails',
            tableName: 'club_details',
            timestamps: true,
            underscored: true,
        }
    );

    return ClubDetails;
};
