const transformToDB = (feData, options = {}) => {
    const { isCreate = false } = options;

    const dbData = {
        club_Club: {
            slug: feData.slug || '',
            name: feData.name || '',
            shortDescription: feData.shortDescription || '',
            foundedYear: feData.foundedYear || 0,
            status: feData.status || '',
            category: feData.category || '',
            logo: feData.logo || '',
            mainImage: feData.mainImage || '',
            createdBy: feData.createdBy || '',
            adminComment: feData.adminComment || '',
            isVerified: feData.isVerified !== undefined ? feData.isVerified : false,
            isPublic: feData.isPublic !== undefined ? feData.isPublic : false,
            isDraft: feData.isDraft,
            rating: feData.rating || 0,
            views: feData.views || 0,
            followers: feData.followers || 0,
            tags: Array.isArray(feData.tags) ? feData.tags : [],
        },

        club_ClubDetails: {
            fullDescription: feData.fullDescription || '',
            gallery: feData.gallery || [],
            media: feData.media || {},
            stats: feData.stats || {},
            management: feData.management || {},
            contacts: feData.contacts || {},
            finances: feData.finances || {},
            regionalInfo: feData.regionalInfo || {},
            achievements: feData.achievements || {},
            socialImpact: feData.socialImpact || {},
            pensionersSpecific: feData.pensionersSpecific || {},
            template: feData.template || '',
            preferences: feData.preferences || {},
        },

        club_ClubLocation: {
            address: feData.location?.address || '',
            city: feData.location?.city || '',
            municipality: feData.location?.municipality || '',
            region: feData.location?.region || '',
            postalCode: feData.location?.postalCode || '',
            coordinates: feData.location?.coordinates || {},
            venue: feData.location?.venue || {},
        },

        club_ClubMembership: {
            totalMembers: feData.membership?.totalMembers || 0,
            maxMembers: feData.membership?.maxMembers || 0,
            ageGroups: feData.membership?.ageGroups || {},
            membershipFee: feData.membership?.membershipFee || {},
            type: feData.membership?.type || '',
            minimumAge: feData.membership?.minimumAge || 0,
            trialPeriod: feData.membership?.trialPeriod || {},
            fees: feData.membership?.fees || {},
            management: feData.membership?.management || {},
            requirements: feData.membership?.requirements || [],
            benefits: feData.membership?.benefits || [],
        },
    };

    if (isCreate) {
        delete dbData.club_Club.id;
        delete dbData.club_ClubDetails.id;
        delete dbData.club_ClubLocation.id;
        delete dbData.club_ClubMembership.id;
    }

    return dbData;
};

const transformClub = (clubData) => {
    const club = clubData.get ? clubData.get() : clubData;

    return {
        // Basic fields
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

        // Location
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

        // Membership
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

        // Members
        members: club.members
            ? club.members.map((member) => {
                  const memberData = member.get ? member.get() : member;
                  return {
                      id: memberData.id?.toString() || '',
                      clubId: memberData.clubId?.toString() || '',
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

        // Media
        media: club.details?.media || {
            videos: [],
            virtualTour: '',
            audioFiles: [],
        },

        // Stats
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

        // Management
        management: club.details?.management || {
            board: [],
        },

        // Activities
        activities: transformActivities(club.activities),

        // Contacts
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

        // Finances
        finances: club.details?.finances || {
            budget: { yearly: 0, currency: '' },
            funding: [],
            sponsors: [],
        },

        // Metadata
        metadata: {
            createdAt: club.createdAt?.toISOString() || '',
            updatedAt: club.updatedAt?.toISOString() || '',
            createdBy: club.createdBy || '',
            isVerified: club.isVerified || false,
            isPublic: club.isPublic || false,
            tags: Array.isArray(club.tags) ? club.tags : [],
            rating: club.rating || 0,
            views: club.views || 0,
            followers: club.followers || 0,
        },

        // Regional info
        regionalInfo: club.details?.regionalInfo || {
            isCentralClub: false,
            centralClubId: '',
            affiliatedClubs: [],
            coverageArea: '',
            regionalRole: '',
        },

        // Achievements
        achievements: club.details?.achievements || {
            awards: [],
            certificates: [],
            recognitions: [],
        },

        // Social impact
        socialImpact: club.details?.socialImpact || {
            volunteering: [],
            communityProjects: [],
            partnerships: [],
        },

        // Pensioners specific
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

        // Template
        template: club.details?.template || '',

        // Preferences
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

const transformMemberToDB = (memberData, options = {}) => {
    const { isCreate = false } = options;

    const dbData = {
        firstName: memberData.firstName || '',
        lastName: memberData.lastName || '',
        phone: memberData.phone || '',
        email: memberData.email || '',
        address: memberData.address || '',
        photo: memberData.photo || {},
        joinDate: memberData.joinDate || '',
        isActive: memberData.isActive !== undefined ? memberData.isActive : true,
        role: memberData.role || '',
        status: memberData.status || '',
        preferences: memberData.preferences || {},
    };

    if (isCreate) {
        delete dbData.id;
        delete dbData.clubId;
    }

    return dbData;
};

const transformActivityToDB = (activityData, type, options = {}) => {
    const { isCreate = false } = options;

    const dbData = {
        type: type,
        name: activityData.name || '',
        title: activityData.title || '',
        description: activityData.description || '',
        data: activityData,
        schedule: type === 'regular' ? activityData.schedule || {} : {},
        isActive: true,
        featured: activityData.featured || false,
    };

    if (isCreate) {
        delete dbData.id;
        delete dbData.clubId;
    }

    return dbData;
};

module.exports = {
    transformToDB,
    transformClub,
    transformActivities,
    transformMemberToDB,
    transformActivityToDB,
};
