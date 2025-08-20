'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Club extends Model {
        static associate(models) {
            // One-to-One relationships
            Club.hasOne(models.club_details, {
                foreignKey: 'clubId',
                as: 'details',
                onDelete: 'CASCADE',
            });

            Club.hasOne(models.club_location, {
                foreignKey: 'clubId',
                as: 'location',
                onDelete: 'CASCADE',
            });

            Club.hasOne(models.club_membership, {
                foreignKey: 'clubId',
                as: 'membership',
                onDelete: 'CASCADE',
            });

            // One-to-Many relationships
            Club.hasMany(models.club_member, {
                foreignKey: 'clubId',
                as: 'members',
                onDelete: 'CASCADE',
            });

            Club.hasMany(models.club_activity, {
                foreignKey: 'clubId',
                as: 'activities',
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

    Club.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            shortDescription: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'short_description',
            },
            foundedYear: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'founded_year',
            },
            status: {
                type: DataTypes.STRING,
                allowNull: true,
                // Values: "active" | "inactive" | "suspended"
            },
            logo: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            mainImage: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'main_image',
            },
            category: {
                type: DataTypes.STRING,
                allowNull: true,
                // Values: "cultural" | "sports" | "social" | "educational" | "general"
            },
            template: {
                type: DataTypes.STRING,
                allowNull: true,
                // Values: "cultural" | "sports" | "traditional" | "social" | "educational" | "active" | "general"
            },
            createdBy: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'created_by',
            },
            isVerified: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false,
                field: 'is_verified',
            },
            isPublic: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true,
                field: 'is_public',
            },
            isDraft: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true,
                field: 'is_draft',
            },
            rating: {
                type: DataTypes.DECIMAL(3, 2),
                allowNull: true,
                defaultValue: 0.0,
            },
            views: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
            },
            followers: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
            },
            totalMembers: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                field: 'total_members',
                comment: 'Denormalized field for performance - actual members in club_members table',
            },
        },
        {
            sequelize,
            modelName: 'Club',
            tableName: 'clubs',
            timestamps: true,
            underscored: true,
        }
    );

    return Club;
};
