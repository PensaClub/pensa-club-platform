const { Club, ClubDetails, ClubLocation, ClubMembership, ClubMember, ClubActivity } = require('../sequelize/models');

/**
 * Transform club data from database format to frontend format
 */
const transformClub = (clubData) => {
    const club = clubData.get ? clubData.get() : clubData;

    return {
        // ОСНОВНА ИНФОРМАЦИЯ
        id: club.id?.toString() || '',
        slug: club.slug || '',
        name: club.name || '',
        shortDescription: club.shortDescription || '',
        fullDescription: club.details?.fullDescription || '',
        foundedYear: club.foundedYear || 0,
        status: club.status || '',
        logo: club.logo || '',
        mainImage: club.mainImage || '',
        gallery: club.details?.gallery || [],
        category: club.category || '',

        // МЕСТОПОЛОЖЕНИЕ
        location: club.location
            ? {
                  address: club.location.address || '',
                  city: club.location.city || '',
                  municipality: club.location.municipality || '',
                  region: club.location.region || '',
                  postalCode: club.location.postalCode || '',
                  coordinates: club.location.coordinates || { lat: 0, lng: 0 },
                  venue: club.location.venue || {
                      type: '',
                      size: '',
                      capacity: 0,
                      facilities: [],
                      accessibility: false,
                  },
              }
            : null,

        // ЧЛЕНСТВО
        membership: club.membership
            ? {
                  totalMembers: club.membership.totalMembers || 0,
                  maxMembers: club.membership.maxMembers || 0,
                  ageGroups: club.membership.ageGroups || {
                      'под-60': 0,
                      '60-70': 0,
                      '70-80': 0,
                      '80+': 0,
                  },
                  membershipFee: club.membership.membershipFee || {
                      monthly: 0,
                      yearly: 0,
                      currency: '',
                  },
                  type: club.membership.type || '',
                  minimumAge: club.membership.minimumAge || 0,
                  trialPeriod: club.membership.trialPeriod || {},
                  fees: club.membership.fees || {},
                  management: club.membership.management || {},
                  requirements: club.membership.requirements || [],
                  benefits: club.membership.benefits || [],
              }
            : null,

        // ЧЛЕНОВЕ
        members: club.members
            ? club.members.map((member) => {
                  const memberData = member.get ? member.get() : member;
                  return {
                      id: memberData.id?.toString() || '',
                      clubId: memberData.clubId?.toString() || '',
                      userId: memberData.userId?.toString() || '',
                      firstName: memberData.firstName || '',
                      lastName: memberData.lastName || '',
                      phone: memberData.phone || '',
                      email: memberData.email || '',
                      address: memberData.address || '',
                      photo: memberData.photo || { src: '', alt: '' },
                      joinDate: memberData.joinDate || '',
                      isActive: memberData.isActive || false,
                      role: memberData.role || '',
                      status: memberData.status || '',
                      preferences: memberData.preferences || {},
                  };
              })
            : [],

        // МЕДИЯ
        media: club.details?.media || {
            videos: [],
            virtualTour: '',
            audioFiles: [],
        },

        // СТАТИСТИКИ
        stats: club.details?.stats || {
            totalMembers: 0,
            programs: 0,
            events: 0,
            performances: 0,
            yearsActive: 0,
            projectsBeneficiaries: 0,
            donationsDistributed: 0,
            competitions: 0,
            avgWeeklyWorkouts: 0,
        },

        // УПРАВЛЕНИЕ
        management: club.details?.management || {
            board: [],
        },

        // ДЕЙНОСТИ
        activities: transformActivities(club.activities),

        // КОНТАКТИ
        contacts: club.details?.contacts || {
            phone: '',
            mobile: '',
            email: '',
            website: '',
            socialMedia: {
                facebook: '',
                instagram: '',
                youtube: '',
                twitter: '',
                linkedin: '',
            },
            workingHours: {
                monday: '',
                tuesday: '',
                wednesday: '',
                thursday: '',
                friday: '',
                saturday: '',
                sunday: '',
                days: {
                    monday: { enabled: false, open: '', close: '' },
                    tuesday: { enabled: false, open: '', close: '' },
                    wednesday: { enabled: false, open: '', close: '' },
                    thursday: { enabled: false, open: '', close: '' },
                    friday: { enabled: false, open: '', close: '' },
                    saturday: { enabled: false, open: '', close: '' },
                    sunday: { enabled: false, open: '', close: '' },
                },
                special: '',
            },
            address: {
                street: '',
                city: '',
                postalCode: '',
                poBox: '',
            },
        },

        // ФИНАНСИ
        finances: club.details?.finances || {
            budget: { yearly: 0, currency: '' },
            funding: [],
            sponsors: [],
        },

        // МЕТАДАННИ
        metadata: {
            createdAt: club.createdAt?.toISOString() || '',
            updatedAt: club.updatedAt?.toISOString() || '',
            createdBy: club.createdBy || '',
            isVerified: club.isVerified || false,
            isPublic: club.isPublic || false,
            tags: club.tags || [],
            rating: club.rating || 0.0,
            views: club.views || 0,
            followers: club.followers || 0,
        },

        // РЕГИОНАЛНА ИНФОРМАЦИЯ
        regionalInfo: club.details?.regionalInfo || {
            isCentralClub: false,
            centralClubId: '',
            affiliatedClubs: [],
            coverageArea: '',
            regionalRole: '',
        },

        // ПОСТИЖЕНИЯ
        achievements: club.details?.achievements || {
            awards: [],
            certificates: [],
            recognitions: [],
        },

        // СОЦИАЛНО ВЪЗДЕЙСТВИЕ
        socialImpact: club.details?.socialImpact || {
            volunteering: [],
            communityProjects: [],
            partnerships: [],
        },

        // СПЕЦИФИЧНИ ЗА ПЕНСИОНЕРИ
        pensionersSpecific: club.details?.pensionersSpecific || {
            healthServices: {
                regularCheckups: false,
                bloodPressureMonitoring: false,
                healthLectures: [],
                medicalPartners: [],
                emergencyProtocol: {
                    hasEmergencyPlan: false,
                    emergencyContacts: [],
                    nearestHospital: '',
                    specialNeeds: [],
                },
            },
            supportServices: {
                homeVisits: false,
                shoppingAssistance: false,
                documentHelp: false,
                companionship: false,
                transportService: false,
                mealDelivery: false,
                cleaningHelp: false,
                techSupport: false,
            },
            accessibility: {
                wheelchairAccess: false,
                elevatorAccess: false,
                hearingLoop: false,
                largeTextMaterials: false,
                handrails: false,
                nonSlipFloors: false,
                goodLighting: false,
                restingAreas: false,
            },
            specialPrograms: {
                memoryActivities: [],
                intergenerationalPrograms: [],
                volunteerPrograms: [],
                mentalHealthSupport: [],
            },
            ageSpecificNeeds: {
                lowImpactActivities: [],
                cognitiveStimulation: [],
                socialIsolationPrevention: [],
                nutritionSupport: [],
                medicationReminders: false,
                fallPrevention: [],
            },
        },

        // ШАБЛОН
        template: club.details?.template || '',

        // НАСТРОЙКИ
        preferences: club.details?.preferences || {
            showFinances: false,
            showMembersList: false,
            allowOnlineRegistration: false,
            showContactForm: false,
            enableCalendar: false,
            showTestimonials: false,
            publicGallery: false,
            showStatistics: false,
            allowComments: false,
            showNewsSection: false,
        },
    };
};

const transformActivities = (activities) => {
    if (!activities || !Array.isArray(activities)) {
        return {
            regular: [],
            events: [],
            trips: [],
            courses: [],
        };
    }

    const transformed = {
        regular: [],
        events: [],
        trips: [],
        courses: [],
    };

    activities.forEach((activity) => {
        const activityData = activity.get ? activity.get() : activity;
        const data = activityData.data || {};

        switch (activityData.type) {
            case 'regular':
                transformed.regular.push({
                    id: data.id || '',
                    name: activityData.name || '',
                    description: activityData.description || '',
                    type: data.type || '',
                    category: data.category || '',
                    schedule: data.schedule || {
                        frequency: '',
                        dayOfWeek: 0,
                        startTime: '',
                        duration: 0,
                    },
                    ageGroup: data.ageGroup || {
                        min: 0,
                        max: 0,
                    },
                    capacity: data.capacity || {
                        min: 0,
                        max: 0,
                    },
                    fee: data.fee || {
                        amount: 0,
                        period: '',
                        required: false,
                    },
                    instructor: data.instructor || '',
                    requirements: data.requirements || '',
                    equipment: data.equipment || [],
                });
                break;
            case 'events':
                transformed.events.push({
                    id: data.id || '',
                    title: data.title || '',
                    date: data.date || '',
                    time: data.time || '',
                    type: data.type || '',
                    participants: data.participants || 0,
                    description: activityData.description || '',
                    location: data.location || '',
                    organizer: data.organizer || '',
                    highlights: data.highlights || [],
                    featured: data.featured || false,
                    price: data.price || '',
                    images: data.images || [],
                    videos: data.videos || [],
                });
                break;
            case 'trips':
                transformed.trips.push({
                    destination: data.destination || '',
                    date: data.date || '',
                    participants: data.participants || 0,
                    price: data.price || 0,
                    description: activityData.description || '',
                });
                break;
            case 'courses':
                transformed.courses.push({
                    name: activityData.name || '',
                    duration: data.duration || '',
                    participants: data.participants || 0,
                    instructor: data.instructor || '',
                    description: activityData.description || '',
                });
                break;
        }
    });

    return transformed;
};

/**
 * Get club configuration for includes and associations
 */
const getClubConfig = (includeDetails = true, includeLocation = true, includeMembership = true, includeMembers = true, includeActivities = true) => {
    const config = {
        include: [],
    };

    if (includeDetails) {
        config.include.push({
            model: ClubDetails,
            as: 'details',
            required: false,
        });
    }

    if (includeLocation) {
        config.include.push({
            model: ClubLocation,
            as: 'location',
            required: false,
        });
    }

    if (includeMembership) {
        config.include.push({
            model: ClubMembership,
            as: 'membership',
            required: false,
        });
    }

    if (includeMembers) {
        config.include.push({
            model: ClubMember,
            as: 'members',
            required: false,
        });
    }

    if (includeActivities) {
        config.include.push({
            model: ClubActivity,
            as: 'activities',
            required: false,
        });
    }

    return config;
};

module.exports = {
    transformClub,
    transformActivities,
    getClubConfig,
};
