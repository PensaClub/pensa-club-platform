const clubController = require('express').Router();
const isAuth = require('../middlewares/isAuth');
const { checkPermission } = require('../middlewares/rbac');
const clubSchema = require('../schemas/club/index.schema');
const {
    club_Club,
    club_ClubDetails,
    club_ClubLocation,
    club_ClubMembership,
    club_ClubMember,
    club_ClubActivity,
    user_account,
} = require('../sequelize/models');
const CustomError = require('../utils/customError');
const { transformClub } = require('../utils/clubUtils');
const { findBySlugOrId } = require('../utils/modelLookup');
// Add the import for comment utils
const { transformComment, getCommentConfig } = require('../utils/commentUtils');
const { comment } = require('../sequelize/models');
const { Op } = require('sequelize');

// ========================================
// ENDPOINTS
// ========================================

clubController.post('/create', isAuth, async (req, res, next) => {
    try {
        const validatedData = clubSchema.parse(req.body);
        const clubData = {
            ...validatedData,
            isDraft: false,
            createdBy: validatedData.metadata?.createdBy || req.user.userId,
        };

        const existing = await club_Club.findOne({
            where: {
                slug: clubData.slug,
                isDraft: false,
            },
        });

        if (existing) {
            req.params.identifier = existing.slug;
            return updateClub(clubData, req, res, next, false);
        } else {
            return createClub(clubData, req, res, next);
        }
    } catch (err) {
        next(err);
    }
});

clubController.post('/draft/save/:identifier?', isAuth, async (req, res, next) => {
    try {
        const { identifier } = req.params;

        if (!identifier) {
            const validatedData = clubSchema.parse(req.body);
            const clubData = {
                ...validatedData,
                isDraft: true,
                createdBy: validatedData.metadata?.createdBy || req.user.userId,
            };
            return createClub(clubData, req, res, next);
        }

        const validatedData = clubSchema.parse(req.body);
        return updateClub(validatedData, req, res, next, true);
    } catch (err) {
        next(err);
    }
});

clubController.get('/all', async (req, res, next) => {
    return getClubsByDraftStatus(false, req, res, next);
});

clubController.get('/drafts', isAuth, async (req, res, next) => {
    return getClubsByDraftStatus(true, req, res, next);
});

clubController.get('/single/:identifier', async (req, res, next) => {
    return getSingleClubByDraftStatus(false, req, res, next);
});

clubController.get('/draft/:identifier', isAuth, async (req, res, next) => {
    return getSingleClubByDraftStatus(true, req, res, next);
});

clubController.put('/:identifier', isAuth, async (req, res, next) => {
    try {
        const validatedData = clubSchema.parse(req.body);
        return updateClub(validatedData, req, res, next, false);
    } catch (err) {
        next(err);
    }
});

clubController.delete('/:identifier', isAuth, async (req, res, next) => {
    return deleteClubByDraftStatus(false, req, res, next);
});

clubController.delete('/draft/:identifier', isAuth, async (req, res, next) => {
    return deleteClubByDraftStatus(true, req, res, next);
});

clubController.patch('/toggle-draft/:identifier', isAuth, async (req, res, next) => {
    try {
        const { identifier } = req.params;

        const result = await club_Club.sequelize.transaction(async (t) => {
            const club = await findBySlugOrId(club_Club, identifier, { transaction: t });

            if (!club) {
                throw new CustomError({
                    message: 'Club not found',
                    statusCode: 404,
                });
            }

            const wasDraft = club.isDraft;
            await club.update({ isDraft: !club.isDraft }, { transaction: t });

            return {
                slug: club.slug,
                wasDraft: wasDraft,
                isNowDraft: !wasDraft,
            };
        });

        const statusMessage = result.wasDraft
            ? `Club with slug '${result.slug}' has been changed from draft to published.`
            : `Club with slug '${result.slug}' has been changed from published to draft.`;

        return res.status(200).json({
            message: statusMessage,
        });
    } catch (err) {
        next(err);
    }
});

clubController.post('/bookmark/:identifier', isAuth, async (req, res, next) => {
    try {
        const { identifier } = req.params;
        const userId = req.user.userId;

        if (!userId) {
            throw new CustomError({
                message: 'User not authenticated',
                statusCode: 401,
            });
        }

        const club = await findBySlugOrId(club_Club, identifier, {
            include: [
                {
                    model: user_account,
                    as: 'bookmarkedBy',
                    where: { id: userId },
                    required: false,
                },
            ],
        });

        if (!club) {
            throw new CustomError({
                message: 'Club not found',
                statusCode: 404,
            });
        }

        if (club.bookmarkedBy?.length > 0) {
            await club.removeBookmarkedBy(userId);
            return res.status(200).json({
                message: 'Bookmark successfully removed.',
                bookmarked: false,
            });
        } else {
            await club.addBookmarkedBy(userId);
            return res.status(201).json({
                message: 'Bookmark successfully added.',
                bookmarked: true,
            });
        }
    } catch (err) {
        next(err);
    }
});

clubController.get('/user-bookmarks/:email', async (req, res, next) => {
    try {
        const { email } = req.params;

        const user = await user_account.findOne({
            where: { email },
            include: [
                {
                    model: club_Club,
                    as: 'bookmarkedClubs',
                    include: [
                        { model: club_ClubDetails, as: 'details' },
                        { model: club_ClubLocation, as: 'location' },
                        { model: club_ClubMembership, as: 'membership' },
                        { model: club_ClubMember, as: 'members' },
                        { model: club_ClubActivity, as: 'activities' },
                    ],
                },
            ],
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
            });
        }

        const transformedClubs = user.bookmarkedClubs.map((club) => transformClub(club));

        return res.status(200).json({
            clubs: transformedClubs,
        });
    } catch (err) {
        next(err);
    }
});

clubController.get('/category/:category', async (req, res, next) => {
    return searchClubsWithFilters({ category: req.params.category }, req, res, next);
});

clubController.get('/region/:region', async (req, res, next) => {
    return searchClubsWithFilters({ region: req.params.region }, req, res, next);
});

clubController.get('/city/:city', async (req, res, next) => {
    return searchClubsWithFilters({ city: req.params.city }, req, res, next);
});

clubController.get('/search', async (req, res, next) => {
    return searchClubsWithFilters(req.query, req, res, next);
});

clubController.get('/featured', async (req, res, next) => {
    return searchClubsWithFilters({ featured: true }, req, res, next);
});

clubController.get('/active', async (req, res, next) => {
    return searchClubsWithFilters({ active: true }, req, res, next);
});

clubController.get('/:identifier/events', async (req, res, next) => {
    return getClubSpecificData(req.params.identifier, 'events', req, res, next);
});

clubController.get('/:identifier/activities', async (req, res, next) => {
    return getClubSpecificData(req.params.identifier, 'activities', req, res, next);
});

clubController.get('/:identifier/trips', async (req, res, next) => {
    return getClubSpecificData(req.params.identifier, 'trips', req, res, next);
});

clubController.get('/:identifier/courses', async (req, res, next) => {
    return getClubSpecificData(req.params.identifier, 'courses', req, res, next);
});

clubController.get('/:identifier/members', async (req, res, next) => {
    return getClubSpecificData(req.params.identifier, 'members', req, res, next);
});

clubController.get('/:identifier/management', async (req, res, next) => {
    return getClubSpecificData(req.params.identifier, 'management', req, res, next);
});

// ========================================
// FUNCTIONS
// ========================================

const createClub = async (clubData, req, res, next) => {
    try {
        const result = await club_Club.sequelize.transaction(async (t) => {
            const club = await club_Club.create(clubData, { transaction: t });

            const detailsData = {
                clubId: club.id,
                fullDescription: clubData.fullDescription || null,
                gallery: clubData.gallery || [],
                media: clubData.media || {},
                stats: clubData.stats || {},
                management: clubData.management || {},
                contacts: clubData.contacts || {},
                finances: clubData.finances || {},
                regionalInfo: clubData.regionalInfo || {},
                achievements: clubData.achievements || {},
                socialImpact: clubData.socialImpact || {},
                pensionersSpecific: clubData.pensionersSpecific || {},
                template: clubData.template || null,
                preferences: clubData.preferences || {},
            };

            await club_ClubDetails.create(detailsData, { transaction: t });

            const locationData = {
                clubId: club.id,
                address: clubData.location?.address || null,
                city: clubData.location?.city || null,
                municipality: clubData.location?.municipality || null,
                region: clubData.location?.region || null,
                postalCode: clubData.location?.postalCode || null,
                coordinates: clubData.location?.coordinates || {},
                venue: clubData.location?.venue || {},
            };

            await club_ClubLocation.create(locationData, { transaction: t });

            const membershipData = {
                clubId: club.id,
                totalMembers: clubData.membership?.totalMembers || 0,
                ageGroups: clubData.membership?.ageGroups || {},
                membershipFee: clubData.membership?.membershipFee || {},
                requirements: clubData.membership?.requirements || [],
                benefits: clubData.membership?.benefits || [],
            };

            await club_ClubMembership.create(membershipData, { transaction: t });

            if (clubData.members && Array.isArray(clubData.members)) {
                for (const memberData of clubData.members) {
                    const member = {
                        clubId: club.id,
                        firstName: memberData.firstName,
                        lastName: memberData.lastName,
                        phone: memberData.phone,
                        email: memberData.email,
                        address: memberData.address,
                        photo: memberData.photo || {},
                        joinDate: memberData.joinDate,
                        isActive: memberData.isActive !== undefined ? memberData.isActive : true,
                        role: memberData.role,
                        status: memberData.status,
                        preferences: memberData.preferences || {},
                    };

                    await club_ClubMember.create(member, { transaction: t });
                }
            }

            const activityTypes = ['regular', 'events', 'trips', 'courses'];

            for (const type of activityTypes) {
                const activities = clubData.activities?.[type] || [];

                if (Array.isArray(activities)) {
                    for (const activityData of activities) {
                        const activity = {
                            clubId: club.id,
                            type: type,
                            name: activityData.name,
                            title: activityData.title,
                            description: activityData.description,
                            data: activityData,
                            schedule: type === 'regular' ? { day: activityData.day, time: activityData.time } : {},
                            isActive: true,
                            featured: activityData.featured || false,
                        };

                        await club_ClubActivity.create(activity, { transaction: t });
                    }
                }
            }

            return club;
        });

        const transformedClub = transformClub(result);

        res.status(201).json({
            ...transformedClub,
        });
    } catch (err) {
        next(err);
    }
};

const getClubsByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        const clubs = await club_Club.findAndCountAll({
            where: { isDraft },
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                { model: club_ClubDetails, as: 'details' },
                { model: club_ClubLocation, as: 'location' },
                { model: club_ClubMembership, as: 'membership' },
                { model: club_ClubMember, as: 'members' },
                { model: club_ClubActivity, as: 'activities' },
            ],
            order: [['createdAt', 'DESC']],
        });

        const clubsWithComments = await Promise.all(
            clubs.rows.map(async (club) => {
                const comments = await comment.findAll(getCommentConfig(club.id, 'club'));
                const transformed = transformClub(club);
                transformed.comments = comments.map((comment) => transformComment(comment));
                return transformed;
            })
        );

        return res.status(200).json({
            clubs: clubsWithComments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(clubs.count / limit),
                totalItems: clubs.count,
                itemsPerPage: parseInt(limit),
            },
        });
    } catch (err) {
        next(err);
    }
};

const getSingleClubByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const { identifier } = req.params;

        const club = await findBySlugOrId(club_Club, identifier, {
            where: { isDraft },
            include: [
                { model: club_ClubDetails, as: 'details' },
                { model: club_ClubLocation, as: 'location' },
                { model: club_ClubMembership, as: 'membership' },
                { model: club_ClubMember, as: 'members' },
                { model: club_ClubActivity, as: 'activities' },
            ],
        });

        if (!club) {
            throw new CustomError({
                message: 'Club not found',
                statusCode: 404,
            });
        }

        const comments = await comment.findAll(getCommentConfig(club.id, 'club'));
        const transformedClub = transformClub(club);
        transformedClub.comments = comments.map((comment) => transformComment(comment));

        return res.status(200).json(transformedClub);
    } catch (err) {
        next(err);
    }
};

const updateClub = async (clubData, req, res, next, isDraft) => {
    try {
        const { identifier } = req.params;

        const result = await club_Club.sequelize.transaction(async (t) => {
            const club = await findBySlugOrId(club_Club, identifier, {
                where: { isDraft },
                transaction: t,
            });

            if (!club) {
                throw new CustomError({
                    message: 'Club not found',
                    statusCode: 404,
                });
            }

            await club.update(clubData, { transaction: t });

            const detailsData = {
                fullDescription: clubData.fullDescription || null,
                gallery: clubData.gallery || [],
                media: clubData.media || {},
                stats: clubData.stats || {},
                management: clubData.management || {},
                contacts: clubData.contacts || {},
                finances: clubData.finances || {},
                regionalInfo: clubData.regionalInfo || {},
                achievements: clubData.achievements || {},
                socialImpact: clubData.socialImpact || {},
                pensionersSpecific: clubData.pensionersSpecific || {},
                template: clubData.template || null,
                preferences: clubData.preferences || {},
            };

            await club_ClubDetails.upsert(
                {
                    clubId: club.id,
                    ...detailsData,
                },
                { transaction: t }
            );

            const locationData = {
                address: clubData.location?.address || null,
                city: clubData.location?.city || null,
                municipality: clubData.location?.municipality || null,
                region: clubData.location?.region || null,
                postalCode: clubData.location?.postalCode || null,
                coordinates: clubData.location?.coordinates || {},
                venue: clubData.location?.venue || {},
            };

            await club_ClubLocation.upsert(
                {
                    clubId: club.id,
                    ...locationData,
                },
                { transaction: t }
            );

            const membershipData = {
                totalMembers: clubData.membership?.totalMembers || 0,
                ageGroups: clubData.membership?.ageGroups || {},
                membershipFee: clubData.membership?.membershipFee || {},
                requirements: clubData.membership?.requirements || [],
                benefits: clubData.membership?.benefits || [],
            };

            await club_ClubMembership.upsert(
                {
                    clubId: club.id,
                    ...membershipData,
                },
                { transaction: t }
            );

            return club;
        });

        const transformedClub = transformClub(result);

        return res.status(200).json(transformedClub);
    } catch (err) {
        next(err);
    }
};

const deleteClubByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const { identifier } = req.params;

        const result = await club_Club.sequelize.transaction(async (t) => {
            const club = await findBySlugOrId(club_Club, identifier, {
                where: { isDraft },
                transaction: t,
            });

            if (!club) {
                throw new CustomError({
                    message: 'Club not found',
                    statusCode: 404,
                });
            }

            await club.destroy({ transaction: t });

            return {
                id: club.id,
                slug: club.slug,
                name: club.name,
            };
        });

        return res.status(200).json({
            message: `Club '${result.name}' has been successfully deleted.`,
            deletedClub: result,
        });
    } catch (err) {
        next(err);
    }
};

const searchClubsWithFilters = async (filters, req, res, next) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = { isDraft: false };
        const locationWhere = {};
        const activityWhere = {};

        if (filters.category) {
            whereClause.category = filters.category;
        }

        if (filters.region) {
            locationWhere.region = filters.region;
        }

        if (filters.city) {
            locationWhere.city = filters.city;
        }

        if (filters.featured) {
            activityWhere.featured = true;
        }

        if (filters.active) {
            activityWhere.isActive = true;
        }

        if (filters.query) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${filters.query}%` } },
                { slug: { [Op.iLike]: `%${filters.query}%` } },
                { shortDescription: { [Op.iLike]: `%${filters.query}%` } },
            ];
        }

        const includeClause = [
            { model: club_ClubDetails, as: 'details' },
            { model: club_ClubLocation, as: 'location', where: Object.keys(locationWhere).length > 0 ? locationWhere : undefined },
            { model: club_ClubMembership, as: 'membership' },
            { model: club_ClubMember, as: 'members' },
            { model: club_ClubActivity, as: 'activities', where: Object.keys(activityWhere).length > 0 ? activityWhere : undefined },
        ];

        const cleanInclude = includeClause.map((include) => {
            if (include.where && Object.keys(include.where).length === 0) {
                delete include.where;
            }
            return include;
        });

        const clubs = await club_Club.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: cleanInclude,
            order: [['createdAt', 'DESC']],
        });

        const clubsWithComments = await Promise.all(
            clubs.rows.map(async (club) => {
                const comments = await comment.findAll(getCommentConfig(club.id, 'club'));
                const transformed = transformClub(club);
                transformed.comments = comments.map((comment) => transformComment(comment));
                return transformed;
            })
        );

        return res.status(200).json({
            clubs: clubsWithComments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(clubs.count / limit),
                totalItems: clubs.count,
                itemsPerPage: parseInt(limit),
            },
        });
    } catch (err) {
        next(err);
    }
};

const getClubSpecificData = async (identifier, dataType, req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const club = await findBySlugOrId(club_Club, identifier, {
            where: { isDraft: false },
            include: [
                { model: club_ClubDetails, as: 'details' },
                { model: club_ClubLocation, as: 'location' },
                { model: club_ClubMembership, as: 'membership' },
                { model: club_ClubMember, as: 'members' },
                { model: club_ClubActivity, as: 'activities' },
            ],
        });

        if (!club) {
            throw new CustomError({
                message: 'Club not found',
                statusCode: 404,
            });
        }

        let result;
        let pagination = null;

        switch (dataType) {
            case 'events':
                const events = club.activities?.filter((activity) => activity.type === 'events') || [];
                result = events;
                break;

            case 'activities':
                const activities = club.activities?.filter((activity) => activity.type === 'regular') || [];
                result = activities;
                break;

            case 'trips':
                const trips = club.activities?.filter((activity) => activity.type === 'trips') || [];
                result = trips;
                break;

            case 'courses':
                const courses = club.activities?.filter((activity) => activity.type === 'courses') || [];
                result = courses;
                break;

            case 'members':
                const members = club.members || [];
                if (req.query.page && req.query.limit) {
                    const startIndex = offset;
                    const endIndex = startIndex + parseInt(limit);
                    result = members.slice(startIndex, endIndex);
                    pagination = {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(members.length / limit),
                        totalItems: members.length,
                        itemsPerPage: parseInt(limit),
                    };
                } else {
                    result = members;
                }
                break;

            case 'management':
                result = club.details?.management || {};
                break;

            default:
                throw new CustomError({
                    message: 'Invalid data type',
                    statusCode: 400,
                });
        }

        const response = { [dataType]: result };
        if (pagination) {
            response.pagination = pagination;
        }

        return res.status(200).json(response);
    } catch (err) {
        next(err);
    }
};

module.exports = clubController;
