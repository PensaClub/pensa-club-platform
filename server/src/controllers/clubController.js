const clubController = require('express').Router();
const isAuth = require('../middlewares/isAuth');
const { checkPermission } = require('../middlewares/rbac');
const clubSchema = require('../schemas/club/index.schema');
const transferOwnershipSchema = require('../schemas/club/transferOwnership.schema');
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
const {
    transformToDB,
    transformClub,
    transformMemberToDB,
    transformActivityToDB,
    processClubAdminAction,
    handleMailingFormEmail,
    handlePersonalEmail,
} = require('../utils/clubUtils');
const { findBySlugOrId } = require('../utils/modelLookup');
const { transformComment, getCommentConfig } = require('../utils/commentUtils');
const { comment } = require('../sequelize/models');
const { Op } = require('sequelize');

// ========================================
// ENDPOINTS
// ========================================

clubController.post('/create', isAuth, async (req, res, next) => {
    try {
        const validatedData = clubSchema.create.parse(req.body);
        const clubData = {
            ...validatedData,
            isDraft: false,
        };

        const existing = await club_Club.findOne({
            where: {
                slug: clubData.slug,
                isDraft: false,
            },
        });

        if (existing) {
            req.params.identifier = existing.slug;
            const updateValidatedData = clubSchema.update.parse(req.body);
            const updateClubData = {
                ...updateValidatedData,
                isDraft: false,
            };
            return updateClub(updateClubData, req, res, next, false);
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
            const validatedData = clubSchema.create.parse(req.body);
            const clubData = {
                ...validatedData,
                isDraft: true,
            };
            return createClub(clubData, req, res, next);
        }

        const validatedData = clubSchema.update.parse(req.body);
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
        const validatedData = clubSchema.update.parse(req.body);
        return updateClub(validatedData, req, res, next, false);
    } catch (err) {
        next(err);
    }
});

clubController.patch('/bulk-update', isAuth, async (req, res, next) => {
    return performAdminAction(req, res, next, 'toggle-status', true);
});

clubController.delete('/bulk-delete', isAuth, async (req, res, next) => {
    return performAdminAction(req, res, next, 'delete', true);
});

clubController.patch('/bulk-approve', isAuth, async (req, res, next) => {
    return performAdminAction(req, res, next, 'approve', true);
});

clubController.delete('/:identifier', isAuth, async (req, res, next) => {
    return deleteClubByDraftStatus(false, req, res, next);
});

clubController.patch('/toggle-draft/:identifier', isAuth, async (req, res, next) => {
    return deleteClubByDraftStatus(true, req, res, next);
});

clubController.patch('/:identifier/status', isAuth, async (req, res, next) => {
    return performAdminAction(req, res, next, 'toggle-status', false);
});

clubController.patch('/:identifier/verify', isAuth, async (req, res, next) => {
    return performAdminAction(req, res, next, 'verify', false);
});

clubController.patch('/:identifier/approve', isAuth, async (req, res, next) => {
    return performAdminAction(req, res, next, 'approve', false);
});

clubController.patch('/:identifier/reject', isAuth, async (req, res, next) => {
    return performAdminAction(req, res, next, 'reject', false);
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

clubController.get('/my-clubs/:email', async (req, res, next) => {
    try {
        const { email } = req.params;
        const { page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        const totalCount = await club_Club.count({
            where: { isDraft: false },
            include: [
                {
                    model: club_ClubMember,
                    as: 'members',
                    where: { email: email },
                    required: true,
                },
            ],
        });

        const clubs = await club_Club.findAll({
            where: { isDraft: false },
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                { model: club_ClubDetails, as: 'details' },
                { model: club_ClubLocation, as: 'location' },
                { model: club_ClubMembership, as: 'membership' },
                {
                    model: club_ClubMember,
                    as: 'members',
                    where: { email: email },
                    required: true,
                },
                { model: club_ClubActivity, as: 'activities' },
            ],
            order: [['createdAt', 'DESC']],
        });

        const clubsWithComments = await Promise.all(
            clubs.map(async (club) => {
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
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: parseInt(limit),
            },
        });
    } catch (err) {
        next(err);
    }
});

clubController.get('/user-clubs', isAuth, async (req, res, next) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;
        const userEmail = req.user.email;

        const totalCount = await club_Club.count({
            where: {
                isDraft: false,
                owner: userEmail,
            },
        });

        const clubs = await club_Club.findAll({
            where: {
                isDraft: false,
                owner: userEmail,
            },
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
            clubs.map(async (club) => {
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
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: parseInt(limit),
            },
        });
    } catch (err) {
        next(err);
    }
});

clubController.patch('/:identifier/transfer-ownership', isAuth, async (req, res, next) => {
    try {
        const { identifier } = req.params;
        const { email } = transferOwnershipSchema.parse(req.body);

        // TODO: Add checkPermission('admin')

        const result = await club_Club.sequelize.transaction(async (t) => {
            const club = await findBySlugOrId(club_Club, identifier, {
                where: { isDraft: false },
                transaction: t,
            });

            if (!club) {
                throw new CustomError({
                    message: 'Club not found',
                    statusCode: 404,
                });
            }

            const newOwner = await user_account.findOne({
                where: { email: email },
                transaction: t,
            });

            if (!newOwner) {
                throw new CustomError({
                    message: 'New owner must be a registered user',
                    statusCode: 400,
                });
            }

            const oldOwner = club.owner;
            await club.update({ owner: email }, { transaction: t });

            return {
                clubSlug: club.slug,
                clubName: club.name,
                oldOwner,
                newOwner: email,
            };
        });

        return res.status(200).json({
            message: `Club ownership transferred successfully from ${result.oldOwner} to ${result.newOwner}`,
            transfer: result,
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

clubController.post('/:identifier/contact', async (req, res, next) => {
    return handleMailingForm(req, res, next, 'contact');
});

clubController.post('/:identifier/membership-application', async (req, res, next) => {
    return handleMailingForm(req, res, next, 'membership');
});

clubController.post('/:identifier/volunteer-application', async (req, res, next) => {
    return handleMailingForm(req, res, next, 'volunteer');
});

clubController.post('/:identifier/partnership-inquiry', async (req, res, next) => {
    return handleMailingForm(req, res, next, 'partnership');
});

clubController.post('/:identifier/sponsorship-inquiry', async (req, res, next) => {
    return handleMailingForm(req, res, next, 'sponsorship');
});

clubController.post('/:identifier/events/:eventTitle/register', async (req, res, next) => {
    return handleMailingForm(req, res, next, 'event');
});

clubController.post('/:identifier/courses/:courseName/register', async (req, res, next) => {
    return handleMailingForm(req, res, next, 'course');
});

clubController.post('/:identifier/trips/:tripDestination/register', async (req, res, next) => {
    return handleMailingForm(req, res, next, 'trip');
});

clubController.post('/personal-email', isAuth, async (req, res, next) => {
    try {
        const validatedData = clubSchema.mailing.personalEmailSchema.parse(req.body);

        const { emailSent, emailError } = await handlePersonalEmail(validatedData);

        if (!emailSent) {
            throw new CustomError({
                message: 'Failed to send email',
                statusCode: 500,
                details: emailError,
            });
        }

        return res.status(200).json({
            message: `Personal email sent successfully from ${validatedData.from} to ${validatedData.to} about "${validatedData.subject}"`,
        });
    } catch (error) {
        next(error);
    }
});

// ========================================
// FUNCTIONS
// ========================================

const createClub = async (clubData, req, res, next) => {
    try {
        const result = await club_Club.sequelize.transaction(async (t) => {
            const dbData = transformToDB(clubData, { isCreate: true });

            dbData.club_Club.owner = req.user.email;

            const club = await club_Club.create(
                {
                    ...dbData.club_Club,
                },
                { transaction: t }
            );

            await club_ClubDetails.create(
                {
                    ...dbData.club_ClubDetails,
                    clubId: club.id,
                },
                { transaction: t }
            );

            await club_ClubLocation.create(
                {
                    ...dbData.club_ClubLocation,
                    clubId: club.id,
                },
                { transaction: t }
            );

            await club_ClubMembership.create(
                {
                    ...dbData.club_ClubMembership,
                    clubId: club.id,
                },
                { transaction: t }
            );

            if (clubData.members && Array.isArray(clubData.members)) {
                for (const memberData of clubData.members) {
                    const memberDbData = transformMemberToDB(memberData, { isCreate: true });

                    await club_ClubMember.create(
                        {
                            ...memberDbData,
                            clubId: club.id,
                        },
                        { transaction: t }
                    );
                }
            }

            const activityTypes = ['regular', 'events', 'trips', 'courses'];

            for (const type of activityTypes) {
                const activities = clubData.activities?.[type] || [];

                if (Array.isArray(activities)) {
                    for (const activityData of activities) {
                        const activityDbData = transformActivityToDB(activityData, type, { isCreate: true });

                        await club_ClubActivity.create(
                            {
                                ...activityDbData,
                                clubId: club.id,
                            },
                            { transaction: t }
                        );
                    }
                }
            }

            return club.id;
        });

        const completeClub = await club_Club.findByPk(result, {
            include: [
                { model: club_ClubDetails, as: 'details' },
                { model: club_ClubLocation, as: 'location' },
                { model: club_ClubMembership, as: 'membership' },
                { model: club_ClubMember, as: 'members' },
                { model: club_ClubActivity, as: 'activities' },
            ],
        });

        const feData = transformClub(completeClub);

        return res.status(201).json({
            ...feData,
        });
    } catch (error) {
        next(error);
    }
};

const getClubsByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        const totalCount = await club_Club.count({
            where: { isDraft },
        });

        const clubs = await club_Club.findAll({
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
            clubs.map(async (club) => {
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
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
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
                include: [
                    { model: club_ClubDetails, as: 'details' },
                    { model: club_ClubLocation, as: 'location' },
                    { model: club_ClubMembership, as: 'membership' },
                    { model: club_ClubMember, as: 'members' },
                    { model: club_ClubActivity, as: 'activities' },
                ],
                transaction: t,
            });

            if (!club) {
                throw new CustomError({
                    message: 'Club not found',
                    statusCode: 404,
                });
            }

            const dbData = transformToDB(clubData, { isCreate: false });

            // Update main club data (only provided fields)
            const clubUpdateData = {};
            Object.keys(dbData.club_Club).forEach((key) => {
                if (clubData[key] !== undefined) {
                    clubUpdateData[key] = dbData.club_Club[key];
                }
            });

            if (Object.keys(clubUpdateData).length > 0) {
                await club.update(clubUpdateData, { transaction: t });
            }

            // Update details (only provided fields)
            if (club.details) {
                const detailsUpdateData = {};
                Object.keys(dbData.club_ClubDetails).forEach((key) => {
                    if (clubData[key] !== undefined) {
                        detailsUpdateData[key] = dbData.club_ClubDetails[key];
                    }
                });

                if (Object.keys(detailsUpdateData).length > 0) {
                    await club.details.update(detailsUpdateData, { transaction: t });
                }
            } else if (Object.keys(dbData.club_ClubDetails).some((key) => clubData[key] !== undefined)) {
                // Create details if they don't exist but data is provided
                await club_ClubDetails.create(
                    {
                        ...dbData.club_ClubDetails,
                        clubId: club.id,
                    },
                    { transaction: t }
                );
            }

            // Update location (only if location data is provided)
            if (clubData.location) {
                if (club.location) {
                    const locationUpdateData = {};
                    Object.keys(dbData.club_ClubLocation).forEach((key) => {
                        if (clubData.location[key] !== undefined) {
                            locationUpdateData[key] = dbData.club_ClubLocation[key];
                        }
                    });

                    if (Object.keys(locationUpdateData).length > 0) {
                        await club.location.update(locationUpdateData, { transaction: t });
                    }
                } else {
                    await club_ClubLocation.create(
                        {
                            ...dbData.club_ClubLocation,
                            clubId: club.id,
                        },
                        { transaction: t }
                    );
                }
            }

            // Update membership (only provided fields)
            if (club.membership) {
                const membershipUpdateData = {};
                Object.keys(dbData.club_ClubMembership).forEach((key) => {
                    if (clubData.membership?.[key] !== undefined) {
                        membershipUpdateData[key] = dbData.club_ClubMembership[key];
                    }
                });

                if (Object.keys(membershipUpdateData).length > 0) {
                    await club.membership.update(membershipUpdateData, { transaction: t });
                }
            } else if (clubData.membership) {
                await club_ClubMembership.create(
                    {
                        ...dbData.club_ClubMembership,
                        clubId: club.id,
                    },
                    { transaction: t }
                );
            }

            // Handle members - replace entire collection (as expected by FE)
            if (clubData.members !== undefined) {
                await club_ClubMember.destroy({
                    where: { clubId: club.id },
                    transaction: t,
                });

                if (Array.isArray(clubData.members)) {
                    for (const memberData of clubData.members) {
                        const memberDbData = transformMemberToDB(memberData, { isCreate: true });

                        await club_ClubMember.create(
                            {
                                ...memberDbData,
                                clubId: club.id,
                            },
                            { transaction: t }
                        );
                    }
                }
            }

            // Handle activities - replace entire collection (as expected by FE)
            if (clubData.activities !== undefined) {
                await club_ClubActivity.destroy({
                    where: { clubId: club.id },
                    transaction: t,
                });

                const activityTypes = ['regular', 'events', 'trips', 'courses'];

                for (const type of activityTypes) {
                    const activities = clubData.activities[type] || [];

                    if (Array.isArray(activities)) {
                        for (const activityData of activities) {
                            const activityDbData = transformActivityToDB(activityData, type, { isCreate: true });

                            await club_ClubActivity.create(
                                {
                                    ...activityDbData,
                                    clubId: club.id,
                                },
                                { transaction: t }
                            );
                        }
                    }
                }
            }

            return club.id;
        });

        const completeClub = await club_Club.findByPk(result, {
            include: [
                { model: club_ClubDetails, as: 'details' },
                { model: club_ClubLocation, as: 'location' },
                { model: club_ClubMembership, as: 'membership' },
                { model: club_ClubMember, as: 'members' },
                { model: club_ClubActivity, as: 'activities' },
            ],
        });

        const transformedClub = transformClub(completeClub);

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

        const totalCount = await club_Club.count({
            where: whereClause,
            include: cleanInclude,
        });

        const clubs = await club_Club.findAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: cleanInclude,
            order: [['createdAt', 'DESC']],
        });

        const clubsWithComments = await Promise.all(
            clubs.map(async (club) => {
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
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
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

const performAdminAction = async (req, res, next, action, bulkFlag = false) => {
    try {
        if (bulkFlag) {
            const { clubIds } = req.body;
            const status = action === 'toggle-status' ? req.body.status : null;

            if (!clubIds || !Array.isArray(clubIds) || clubIds.length === 0) {
                throw new CustomError({
                    message: 'clubIds array is required for bulk actions',
                    statusCode: 400,
                });
            }

            if (action === 'toggle-status' && !status) {
                throw new CustomError({
                    message: 'status is required for toggle-status action',
                    statusCode: 400,
                });
            }

            // TODO: Add checkPermission('admin')

            const results = await club_Club.sequelize.transaction(async (t) => {
                const clubs = [];
                const remainingClubIds = [];

                for (const identifier of clubIds) {
                    const club = await findBySlugOrId(club_Club, identifier, {
                        where: { isDraft: false },
                        transaction: t,
                    });

                    if (club) {
                        clubs.push(club);
                    }
                }

                if (clubs.length === 0) {
                    throw new CustomError({
                        message: 'No clubs found for bulk action',
                        statusCode: 404,
                    });
                }

                for (const club of clubs) {
                    const { updateData, emailSent, emailError } = await processClubAdminAction(
                        club,
                        action,
                        { status, reason: null, customMessage: null },
                        req.user.email
                    );

                    if (action === 'delete') {
                        await club.destroy({ transaction: t });
                    } else {
                        if (updateData) {
                            await club.update(updateData, { transaction: t });
                        }
                        remainingClubIds.push(club.id);
                    }

                    if (!emailSent) {
                        console.error('Email sending failed for club:', club.id, emailError);
                    }
                }

                return remainingClubIds;
            });

            if (results.length === 0) {
                return res.status(200).json([]);
            }

            const completeClubs = await Promise.all(
                results.map(async (clubId) => {
                    const completeClub = await club_Club.findByPk(clubId, {
                        include: [
                            { model: club_ClubDetails, as: 'details' },
                            { model: club_ClubLocation, as: 'location' },
                            { model: club_ClubMembership, as: 'membership' },
                            { model: club_ClubMember, as: 'members' },
                            { model: club_ClubActivity, as: 'activities' },
                        ],
                    });

                    const comments = await comment.findAll(getCommentConfig(completeClub.id, 'club'));
                    const transformedClub = transformClub(completeClub);
                    transformedClub.comments = comments.map((comment) => transformComment(comment));

                    return transformedClub;
                })
            );

            return res.status(200).json(completeClubs);
        } else {
            const { status, reason, message: customMessage } = req.body;
            const identifier = req.params.identifier;

            if (!identifier) {
                throw new CustomError({
                    message: 'Identifier is required for single club actions',
                    statusCode: 400,
                });
            }

            // TODO: Add checkPermission('admin')

            const result = await club_Club.sequelize.transaction(async (t) => {
                const club = await findBySlugOrId(club_Club, identifier, {
                    where: { isDraft: false },
                    transaction: t,
                });

                if (!club) {
                    throw new CustomError({
                        message: 'Club not found',
                        statusCode: 404,
                    });
                }

                const { updateData, emailSent, emailError } = await processClubAdminAction(club, action, { status, reason, customMessage }, req.user.email);

                await club.update(updateData, { transaction: t });

                if (!emailSent) {
                    console.error('Email sending failed for club:', club.id, emailError);
                }

                return club.id;
            });

            const completeClub = await club_Club.findByPk(result, {
                include: [
                    { model: club_ClubDetails, as: 'details' },
                    { model: club_ClubLocation, as: 'location' },
                    { model: club_ClubMembership, as: 'membership' },
                    { model: club_ClubMember, as: 'members' },
                    { model: club_ClubActivity, as: 'activities' },
                ],
            });

            const comments = await comment.findAll(getCommentConfig(completeClub.id, 'club'));
            const transformedClub = transformClub(completeClub);
            transformedClub.comments = comments.map((comment) => transformComment(comment));

            return res.status(200).json(transformedClub);
        }
    } catch (err) {
        next(err);
    }
};

const handleMailingForm = async (req, res, next, formType) => {
    try {
        const { identifier } = req.params;
        let validatedData;

        switch (formType) {
            case 'contact':
                validatedData = clubSchema.mailing.contactFormSchema.parse(req.body);
                break;
            case 'membership':
                validatedData = clubSchema.mailing.membershipApplicationSchema.parse(req.body);
                break;
            case 'volunteer':
                validatedData = clubSchema.mailing.volunteerApplicationSchema.parse(req.body);
                break;
            case 'partnership':
                validatedData = clubSchema.mailing.partnershipInquirySchema.parse(req.body);
                break;
            case 'sponsorship':
                validatedData = clubSchema.mailing.sponsorshipInquirySchema.parse(req.body);
                break;
            case 'event':
                validatedData = clubSchema.mailing.eventRegistrationSchema.parse(req.body);
                break;
            case 'course':
                validatedData = clubSchema.mailing.courseRegistrationSchema.parse(req.body);
                break;
            case 'trip':
                validatedData = clubSchema.mailing.tripRegistrationSchema.parse(req.body);
                break;
            default:
                throw new CustomError({
                    message: 'Invalid form type',
                    statusCode: 400,
                });
        }

        const club = await findBySlugOrId(club_Club, identifier, {
            where: { isDraft: false },
            include: [
                {
                    model: club_ClubDetails,
                    as: 'details',
                    attributes: ['contacts'],
                },
            ],
            attributes: ['id', 'name'],
        });

        if (!club) {
            throw new CustomError({
                message: 'Club not found',
                statusCode: 404,
            });
        }

        const { emailSent, emailError } = await handleMailingFormEmail(
            club,
            formType,
            validatedData,
            req.params.eventTitle || req.params.courseName || req.params.tripDestination
        );

        if (!emailSent) {
            console.error('Email sending failed:', emailError);
            throw new CustomError({
                message: 'Failed to send email',
                statusCode: 500,
            });
        }

        return res.status(200).json({
            message: 'Your message has been sent successfully to the club contact.',
            clubName: club.name,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

module.exports = clubController;
