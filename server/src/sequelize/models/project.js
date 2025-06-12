'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class project extends Model {
        static associate(models) {
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
                    image_link_connection: 'project',
                },
            });

            project.hasOne(models.image, {
                as: 'logo',
                foreignKey: 'imageableId',
                constraints: false,
                scope: {
                    image_link_connection: 'project',
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
                    is_main_contact: true,
                },
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
            slug: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            shortDescription: {
                type: DataTypes.STRING,
                allowNull: true,
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

            // Budget fields
            budgetTotal: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                field: 'budget_total',
            },
            budgetCurrency: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'budget_currency',
            },
            budgetFunded: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                field: 'budget_funded',
            },
            budgetGoal: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                field: 'budget_goal',
            },

            // Timeline fields
            startDate: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'start_date',
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'end_date',
            },
            estimatedDuration: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'estimated_duration',
            },

            // Location fields
            address: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            lat: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            lng: {
                type: DataTypes.FLOAT,
                allowNull: true,
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
        },
        {
            sequelize,
            modelName: 'project',
            timestamps: true,
        }
    );

    return project;
};
