'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class user_account extends Model {
        static associate(models) {
            user_account.hasOne(models.user_details, {
                foreignKey: 'userAccountsId',
                sourceKey: 'id',
                as: 'details',
            });

            user_account.hasMany(models.user_ads, {
                foreignKey: 'userId',
                sourceKey: 'id',
                as: 'ads',
            });

            user_account.hasMany(models.refreshToken, {
                foreignKey: 'userId',
                sourceKey: 'id',
                as: 'refreshTokens',
            });

            // Initiatives created by user
            user_account.hasMany(models.initiative, {
                foreignKey: 'creatorId',
                sourceKey: 'id',
                as: 'initiatives',
            });

            // Projects created by user
            user_account.hasMany(models.project, {
                foreignKey: 'creatorId',
                sourceKey: 'id',
                as: 'projects',
            });

            // Publications created by user
            user_account.hasMany(models.publication, {
                foreignKey: 'creatorId',
                sourceKey: 'id',
                as: 'publications',
            });

            // Stories created by user
            user_account.hasMany(models.story, {
                foreignKey: 'creatorId',
                sourceKey: 'id',
                as: 'stories',
            });

            // Bookmarked initiatives
            user_account.belongsToMany(models.initiative, {
                through: 'initiative_bookmarks',
                as: 'bookmarkedInitiatives',
                foreignKey: 'user_id',
                otherKey: 'initiative_id',
            });

            // Bookmarked projects
            user_account.belongsToMany(models.project, {
                through: 'project_bookmarks',
                as: 'bookmarkedProjects',
                foreignKey: 'user_id',
                otherKey: 'project_id',
            });

            // Bookmarked publications
            user_account.belongsToMany(models.publication, {
                through: 'publication_bookmarks',
                as: 'bookmarkedPublications',
                foreignKey: 'user_id',
                otherKey: 'publication_id',
            });

            // Bookmarked stories
            user_account.belongsToMany(models.story, {
                through: 'story_bookmarks',
                as: 'bookmarkedStories',
                foreignKey: 'user_id',
                otherKey: 'story_id',
            });

            // Liked publications
            user_account.belongsToMany(models.publication, {
                through: 'publication_likes',
                as: 'likedPublications',
                foreignKey: 'user_id',
                otherKey: 'publication_id',
            });

            // Liked stories
            user_account.belongsToMany(models.story, {
                through: 'story_likes',
                as: 'likedStories',
                foreignKey: 'user_id',
                otherKey: 'story_id',
            });

            user_account.hasMany(models.project_application, {
                foreignKey: 'userId',
                as: 'projectApplications',
            });

            user_account.belongsToMany(models.club_Club, {
                through: 'club_bookmarks',
                as: 'bookmarkedClubs',
                foreignKey: 'user_id',
                otherKey: 'club_id',
            });
            // Mentor application
            user_account.hasOne(models.mentor_application, {
                foreignKey: 'userId',
                sourceKey: 'id',
                as: 'mentorApplication',
            });

            // Mentor profile
            user_account.hasOne(models.mentor, {
                foreignKey: 'userId',
                sourceKey: 'id',
                as: 'mentorProfile',
            });
            user_account.hasOne(models.student, {
                foreignKey: 'userId',
                sourceKey: 'id',
                as: 'studentProfile',
            });
        }
    }

    user_account.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: {
                        msg: 'Email format is incorrect.',
                    },
                    notEmpty: {
                        msg: 'Email is required.',
                    },
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            finished: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            reset_token: DataTypes.STRING,
            token_expiration: DataTypes.DATE,
            role: {
                type: DataTypes.STRING,
                values: ['admin', 'moderator', 'user', 'guest', 'limited', 'mentor'],
                allowNull: false,
                defaultValue: 'user',
                validate: {
                    isIn: {
                        args: [['admin', 'moderator', 'user', 'guest', 'limited', 'mentor']],
                        msg: 'Role must be one of the following: admin, moderator, user, limited or guest.',
                    },
                },
            },
            roleChangeComment: {
                type: DataTypes.STRING(1000),
                allowNull: true,
                defaultValue: null,
                set(value) {
                    this.setDataValue('roleChangeComment', value === '' ? null : value);
                },
                field: 'role_change_comment',
                validate: {
                    customValidator(value) {
                        if (value !== null && value !== undefined && value !== '') {
                            if (value.length > 1000) {
                                throw new Error('Maximum comment length limit of 1000 characters is reached.');
                            }
                        }
                    },
                },
            },
            isGoogleUser: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_google_user',
            },
            isMentor: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_mentor',
            },
        },
        {
            sequelize,
            modelName: 'user_account',
        }
    );

    return user_account;
};
