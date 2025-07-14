'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class project extends Model {
        static associate(models) {
            project.belongsTo(models.user_account, {
                foreignKey: 'creatorId',
                as: 'creator',
            });

            project.belongsToMany(models.initiative, {
                through: 'initiative_projects',
                as: 'initiatives',
                foreignKey: 'project_id',
                otherKey: 'initiative_id',
            });

            project.belongsToMany(models.story, {
                through: 'project_stories',
                as: 'stories',
                foreignKey: 'project_id',
                otherKey: 'story_id',
            });

            project.belongsToMany(models.publication, {
                through: 'project_publications',
                as: 'publications',
                foreignKey: 'project_id',
                otherKey: 'publication_id',
            });

            project.hasMany(models.section, {
                as: 'sections',
                foreignKey: 'sectionableId',
                constraints: false,
                scope: {
                    section_link_connection: 'project',
                },
            });

            project.hasOne(models.image, {
                as: 'mainImage',
                foreignKey: 'imageableId',
                constraints: false,
                scope: {
                    image_link_connection: 'project_main',
                },
            });

            project.hasMany(models.comment, {
                as: 'comments',
                foreignKey: 'commentableId',
                constraints: false,
                scope: {
                    comment_link_connection: 'project',
                },
            });

            project.hasMany(models.downloadMaterial, {
                as: 'downloadMaterials',
                foreignKey: 'downloadableId',
                constraints: false,
                scope: {
                    download_link_connection: 'project',
                },
            });

            project.hasMany(models.contact, {
                as: 'team',
                foreignKey: 'contactableId',
                constraints: false,
                scope: {
                    contact_link_connection: 'project',
                    is_team_member: true,
                },
            });

            project.hasOne(models.contact, {
                as: 'contact',
                foreignKey: 'contactableId',
                constraints: false,
                scope: {
                    contact_link_connection: 'project',
                },
            });

            project.hasMany(models.sponsor, {
                foreignKey: 'sponsorableId',
                constraints: false,
                scope: { sponsor_link_connection: 'project' },
                as: 'sponsors',
            });

            project.hasMany(models.partner, {
                foreignKey: 'partnerableId',
                constraints: false,
                scope: { partner_link_connection: 'project' },
                as: 'partners',
            });

            project.hasMany(models.milestone, {
                foreignKey: 'projectId',
                as: 'milestones',
            });

            project.belongsToMany(models.user_account, {
                through: 'project_bookmarks',
                as: 'bookmarkedBy',
                foreignKey: 'project_id',
                otherKey: 'user_id',
            });

            project.hasMany(models.project_application, {
                foreignKey: 'projectId',
                as: 'applications',
            });
        }
    }

    project.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            creatorId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'user_accounts',
                    key: 'id',
                },
                field: 'creator_id',
                onDelete: 'CASCADE',
            },
            slug: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            shortDescription: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'short_description',
            },
            fullDescription: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'full_description',
            },
            category: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('in-progress', 'active', 'planned', 'completed'),
                allowNull: true,
                defaultValue: 'in-progress',
            },
            priority: {
                type: DataTypes.ENUM('low', 'medium', 'high'),
                allowNull: true,
            },

            // Budget fields - JSONB structure:
            // {
            //   total: number,
            //   currency: string,
            //   funded: number,
            //   goal: number
            // }
            budget: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
            },

            // Timeline fields - JSONB structure:
            // {
            //   startDate: string (ISO date),
            //   endDate: string (ISO date),
            //   estimatedDuration: string
            // }
            timeline: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
            },

            // Location fields - JSONB structure:
            // [
            //   {
            //     address: string,
            //     coordinates: {
            //       lat: number,
            //       lng: number
            //     }
            //   }
            // ]
            location: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
            },

            // Application fields
            applicationStatus: {
                type: DataTypes.ENUM('open', 'closed'),
                allowNull: true,
                field: 'application_status',
                defaultValue: 'open',
            },
            applicationDeadline: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'application_deadline',
            },
            maxParticipants: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'max_participants',
            },
            currentParticipants: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'current_participants',
            },
            participantRequirements: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: true,
                field: 'participant_requirements',
            },

            tags: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: true,
            },
            commentsEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                field: 'comments_enabled',
                defaultValue: true,
            },
            logo: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            isDraft: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_draft',
            },
        },
        {
            sequelize,
            modelName: 'project',
            timestamps: true,
            underscored: true,
        }
    );

    return project;
};
