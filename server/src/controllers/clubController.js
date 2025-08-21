const clubController = require('express').Router();
const isAuth = require('../middlewares/isAuth');
const { checkPermission } = require('../middlewares/rbac');
const clubSchema = require('../schemas/club/index.schema');
const { club_Club, club_ClubDetails, club_ClubLocation, club_ClubMembership, club_ClubMember, club_ClubActivity } = require('../sequelize/models');
const CustomError = require('../utils/customError');
const { transformClub } = require('../utils/clubUtils');

// clubController.post('/create', isAuth, checkPermission('clubs', 'create'), async (req, res, next) => {
clubController.post('/create', async (req, res, next) => {
    try {
        // Validate the request body using our club schema
        const validatedData = clubSchema.parse(req.body);

        // Start a transaction to create all related records
        const result = await club_Club.sequelize.transaction(async (t) => {
            // Create the main club record
            const clubData = {
                slug: validatedData.slug,
                name: validatedData.name,
                shortDescription: validatedData.shortDescription,
                foundedYear: validatedData.foundedYear,
                status: validatedData.status || 'active',
                logo: validatedData.logo,
                mainImage: validatedData.mainImage,
                category: validatedData.category,
                createdBy: req.user?.id || 'Anon', // Use optional chaining
                isVerified: validatedData.isVerified || false,
                isPublic: validatedData.isPublic !== undefined ? validatedData.isPublic : true,
                rating: validatedData.rating || 0,
                views: validatedData.views || 0,
                followers: validatedData.followers || 0,
                tags: validatedData.tags || [],
            };

            const club = await club_Club.create(clubData, { transaction: t });

            // Create club details if provided
            if (
                validatedData.fullDescription ||
                validatedData.gallery ||
                validatedData.media ||
                validatedData.stats ||
                validatedData.management ||
                validatedData.contacts ||
                validatedData.finances ||
                validatedData.regionalInfo ||
                validatedData.achievements ||
                validatedData.socialImpact ||
                validatedData.pensionersSpecific ||
                validatedData.template ||
                validatedData.preferences
            ) {
                const detailsData = {
                    clubId: club.id,
                    fullDescription: validatedData.fullDescription,
                    gallery: validatedData.gallery || [],
                    media: validatedData.media || {},
                    stats: validatedData.stats || {},
                    management: validatedData.management || {},
                    contacts: validatedData.contacts || {},
                    finances: validatedData.finances || {},
                    regionalInfo: validatedData.regionalInfo || {},
                    achievements: validatedData.achievements || {},
                    socialImpact: validatedData.socialImpact || {},
                    pensionersSpecific: validatedData.pensionersSpecific || {},
                    template: validatedData.template,
                    preferences: validatedData.preferences || {},
                };

                await club_ClubDetails.create(detailsData, { transaction: t });
            }

            // Create club location if provided
            if (validatedData.location) {
                const locationData = {
                    clubId: club.id,
                    address: validatedData.location.address,
                    city: validatedData.location.city,
                    municipality: validatedData.location.municipality,
                    region: validatedData.location.region,
                    postalCode: validatedData.location.postalCode,
                    coordinates: validatedData.location.coordinates || {},
                    venue: validatedData.location.venue || {},
                };

                await club_ClubLocation.create(locationData, { transaction: t });
            }

            // Create club membership if provided
            if (validatedData.membership) {
                const membershipData = {
                    clubId: club.id,
                    totalMembers: validatedData.membership.totalMembers || 0,
                    ageGroups: validatedData.membership.ageGroups || {},
                    membershipFee: validatedData.membership.membershipFee || {},
                    requirements: validatedData.membership.requirements || [],
                    benefits: validatedData.membership.benefits || [],
                };

                await club_ClubMembership.create(membershipData, { transaction: t });
            }

            // Create club members if provided
            if (validatedData.members && Array.isArray(validatedData.members)) {
                for (const memberData of validatedData.members) {
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

            // Create club activities if provided
            if (validatedData.activities) {
                const activityTypes = ['regular', 'events', 'trips', 'courses'];

                for (const type of activityTypes) {
                    if (validatedData.activities[type] && Array.isArray(validatedData.activities[type])) {
                        for (const activityData of validatedData.activities[type]) {
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
            }

            return club;
        });

        // Transform the data for frontend
        const transformedClub = transformClub(result);

        res.status(201).json({
            ...transformedClub,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = clubController;
