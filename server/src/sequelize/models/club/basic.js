'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Club extends Model {
        static associate(models) {
            // One-to-One relationships
            Club.hasOne(models.club_ClubDetails, {
                foreignKey: 'clubId',
                as: 'details',
                onDelete: 'CASCADE',
            });

            Club.hasOne(models.club_ClubLocation, {
                foreignKey: 'clubId',
                as: 'location',
                onDelete: 'CASCADE',
            });

            Club.hasOne(models.club_ClubMembership, {
                foreignKey: 'clubId',
                as: 'membership',
                onDelete: 'CASCADE',
            });

            // One-to-Many relationships
            Club.hasMany(models.club_ClubMember, {
                foreignKey: 'clubId',
                as: 'members',
                onDelete: 'CASCADE',
            });

            Club.hasMany(models.club_ClubActivity, {
                foreignKey: 'clubId',
                as: 'activities',
                onDelete: 'CASCADE',
            });

            // Many-to-Many relationships
            Club.belongsToMany(models.user_account, {
                through: 'club_bookmarks',
                as: 'bookmarkedBy',
                foreignKey: 'club_id',
                otherKey: 'user_id',
            });

            Club.hasMany(models.comment, {
                foreignKey: 'commentableId',
                as: 'comments',
                scope: {
                    commentLinkConnection: 'club',
                },
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
                allowNull: false,
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
                defaultValue: 'active',
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
            createdBy: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'created_by',
            },
            owner: {
                type: DataTypes.STRING,
                allowNull: true,
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
            tags: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
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
