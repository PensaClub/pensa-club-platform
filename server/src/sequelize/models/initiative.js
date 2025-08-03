'use strict';
const { Model } = require('sequelize');
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class initiative extends Model {
        static associate(models) {
            initiative.belongsTo(models.user_account, {
                foreignKey: 'creatorId',
                as: 'creator',
            });

            initiative.belongsToMany(models.project, {
                through: 'initiative_projects',
                as: 'projects',
                foreignKey: 'initiative_id',
                otherKey: 'project_id',
            });

            initiative.belongsToMany(models.story, {
                through: 'initiative_stories',
                as: 'stories',
                foreignKey: 'initiative_id',
                otherKey: 'story_id',
            });

            initiative.belongsToMany(models.publication, {
                through: 'initiative_publications',
                as: 'publications',
                foreignKey: 'initiative_id',
                otherKey: 'publication_id',
            });

            initiative.hasMany(models.downloadMaterial, {
                foreignKey: 'downloadableId',
                constraints: false,
                scope: {
                    download_link_connection: 'initiative_materials',
                },
                as: 'downloadMaterials',
            });

            initiative.hasMany(models.downloadMaterial, {
                foreignKey: 'downloadableId',
                constraints: false,
                scope: {
                    download_link_connection: 'initiative_documents',
                },
                as: 'documents',
            });

            initiative.hasMany(models.contact, {
                foreignKey: 'contactableId',
                constraints: false,
                scope: {
                    contact_link_connection: 'initiative_additional',
                },
                as: 'additionalContacts',
            });

            initiative.hasOne(models.contact, {
                foreignKey: 'contactableId',
                constraints: false,
                scope: {
                    contact_link_connection: 'initiative_contact',
                    is_main_contact: true,
                },
                as: 'contact',
            });

            initiative.hasOne(models.contact, {
                foreignKey: 'contactableId',
                constraints: false,
                scope: {
                    contact_link_connection: 'initiative_responsible',
                },
                as: 'responsible',
            });

            initiative.hasOne(models.image, {
                as: 'mainImage',
                foreignKey: 'imageableId',
                constraints: false,
                scope: {
                    image_link_connection: 'initiative_main',
                },
            });

            initiative.hasMany(models.image, {
                as: 'mainImageGallery',
                foreignKey: 'imageableId',
                constraints: false,
                scope: {
                    image_link_connection: 'initiative_main_gallery',
                },
            });

            initiative.hasMany(models.section, {
                as: 'sections',
                foreignKey: 'sectionableId',
                constraints: false,
                scope: {
                    section_link_connection: 'initiative',
                },
            });

            initiative.hasMany(models.comment, {
                foreignKey: 'commentableId',
                as: 'comments',
                constraints: false,
                scope: {
                    comment_link_connection: 'initiative',
                },
            });

            initiative.belongsToMany(models.user_account, {
                through: 'initiative_bookmarks',
                as: 'bookmarkedBy',
                foreignKey: 'initiative_id',
                otherKey: 'user_id',
            });

            initiative.hasMany(models.sponsor, {
                foreignKey: 'sponsorableId',
                constraints: false,
                scope: { sponsor_link_connection: 'initiative' },
                as: 'sponsors',
            });

            initiative.hasMany(models.partner, {
                foreignKey: 'partnerableId',
                constraints: false,
                scope: { partner_link_connection: 'initiative' },
                as: 'partners',
            });

            initiative.belongsToMany(models.initiative, {
                through: 'initiative_relations',
                as: 'relatedInitiatives',
                foreignKey: 'initiative_id',
                otherKey: 'related_initiative_id',
            });
        }
    }
    initiative.init(
        {
            // Primary key
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

            // Basic info
            slug: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            title: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            shortDescription: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'short_description',
            },
            detailedDescription: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'detailed_description',
            },
            category: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            customCategory: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'custom_category',
            },
            priority: {
                type: DataTypes.ENUM('Low', 'Medium', 'High'),
                allowNull: true,
                defaultValue: 'Low',
            },

            // Location
            location: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
            },

            // Status and campaign
            status: {
                type: DataTypes.ENUM('in-progress', 'active', 'planned', 'completed'),
                allowNull: true,
                defaultValue: 'in-progress',
            },
            campaignStatus: {
                type: DataTypes.ENUM('open', 'closed'),
                allowNull: true,
                defaultValue: 'open',
                field: 'campaign_status',
            },

            // Dates and milestones
            startDate: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'start_date',
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'end_date',
                get() {
                    const value = this.getDataValue('endDate');
                    return value === '' ? null : value;
                },
                set(value) {
                    this.setDataValue('endDate', value === '' ? null : value);
                },
            },
            timestamp: {
                type: DataTypes.DATE,
                allowNull: true,
                get() {
                    const value = this.getDataValue('timestamp');
                    return value === '' ? null : value;
                },
                set(value) {
                    this.setDataValue('timestamp', value === '' ? null : value);
                },
            },
            duration: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            milestones: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
            },

            // Target audience
            targetAge: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: true,
                defaultValue: [],
                field: 'target_age',
            },
            targetAudience: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: true,
                defaultValue: [],
                field: 'target_audience',
            },
            customAudience: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'custom_audience',
            },

            // Budget and funding
            expectedBudget: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'expected_budget',
            },
            currency: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'currency',
            },
            fundingSources: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: true,
                defaultValue: [],
                field: 'funding_sources',
            },

            // Organization and contact
            organization: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            logo: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            contactEmail: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'contact_email',
            },
            contactPhone: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'contact_phone',
            },

            // Social media and content
            socialMedia: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            kpis: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            expectedResults: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'expected_results',
            },
            progressReport: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'progress_report',
            },
            impactMetrics: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
                field: 'impact_metrics',
            },
            testimonials: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            faq: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            tags: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: true,
                defaultValue: [],
            },
            commentsEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true,
                field: 'comments_enabled',
            },
            isDraft: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_draft',
            },
            gallery: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            publishedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'published_at',
            },
        },
        {
            sequelize,
            modelName: 'initiative',
            timestamps: true,
            underscored: true,
        }
    );
    return initiative;
};
