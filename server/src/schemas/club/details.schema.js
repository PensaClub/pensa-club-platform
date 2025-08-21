const { z } = require('zod');
const { optionalString, optionalNumber, optionalEnum } = require('./helpers');

const detailsSchema = z.object({
    id: z.string().optional(),
    clubId: z.string().optional(),

    fullDescription: optionalString(),

    // Media collections
    gallery: z.array(z.string()).optional(),

    media: z.object({
        videos: z.array(z.object({
            src: optionalString(),
            alt: optionalString(),
            caption: optionalString(),
            type: optionalEnum(['intro', 'event', 'cultural', 'social', 'fitness', 'aqua_fitness', 'yoga', 'charity'], 'Invalid video type'),
            duration: optionalString(),
            thumbnail: optionalString(),
        })).optional(),
        virtualTour: optionalString(),
        audioFiles: z.array(z.object({
            src: optionalString(),
            alt: optionalString(),
            caption: optionalString(),
            duration: optionalString(),
        })).optional(),
    }).optional(),

    // Statistics
    stats: z.object({
        totalMembers: optionalNumber(0),
        programs: optionalNumber(0),
        events: optionalNumber(0),
        performances: optionalNumber(0),
        yearsActive: optionalNumber(0),
        projectsBeneficiaries: optionalNumber(0),
        donationsDistributed: optionalNumber(0),
        competitions: optionalNumber(0),
        avgWeeklyWorkouts: optionalNumber(0),
    }).optional(),

    // Management information
    management: z.object({
        board: z.array(z.object({
            name: optionalString(),
            role: optionalEnum([
                'председател', 'заместник-председател', 'секретар', 'касиер',
                'културен деец', 'треньор-координатор', 'инструктор йога',
                'координатор проекти', 'член'
            ], 'Invalid role'),
            phone: optionalString(),
            email: optionalString(),
            address: optionalString(),
            avatar: optionalString(),
            bio: optionalString(),
        })).optional(),
    }).optional(),

    // Contact information
    contacts: z.object({
        phone: optionalString(),
        mobile: optionalString(),
        email: optionalString(),
        website: optionalString(),
        socialMedia: z.object({
            facebook: optionalString(),
            instagram: optionalString(),
            youtube: optionalString(),
            twitter: optionalString(),
            linkedin: optionalString(),
        }).optional(),
        workingHours: z.object({
            monday: optionalString(),
            tuesday: optionalString(),
            wednesday: optionalString(),
            thursday: optionalString(),
            friday: optionalString(),
            saturday: optionalString(),
            sunday: optionalString(),
        }).optional(),
    }).optional(),

    // Financial information
    finances: z.object({
        budget: z.object({
            yearly: optionalNumber(0),
            currency: optionalEnum(['BGN', 'EUR', 'USD'], 'Currency must be BGN, EUR, or USD'),
        }).optional(),
        funding: z.array(z.object({
            source: optionalString(),
            amount: optionalNumber(0),
            type: optionalEnum(['subsidy', 'membership', 'donations', 'events', 'sponsorship'], 'Invalid funding type'),
        })).optional(),
        sponsors: z.array(z.object({
            name: optionalString(),
            contribution: optionalString(),
            type: optionalEnum(['services', 'discounts', 'goods', 'money'], 'Invalid sponsor type'),
            contact: optionalString(),
            address: optionalString(),
            website: optionalString(),
            workingHours: optionalString(),
            discount: optionalString(),
            description: optionalString(),
        })).optional(),
    }).optional(),

    // Regional information
    regionalInfo: z.object({
        isCentralClub: z.boolean().optional(),
        centralClubId: optionalString(),
        affiliatedClubs: z.array(z.string()).optional(),
        coverageArea: optionalString(),
        regionalRole: optionalEnum(['local', 'central', 'branch'], 'Invalid regional role'),
    }).optional(),

    // Achievements and recognition
    achievements: z.object({
        awards: z.array(z.object({
            name: optionalString(),
            year: optionalNumber(1900, new Date().getFullYear()),
            awardedBy: optionalString(),
            description: optionalString(),
        })).optional(),
        certificates: z.array(z.object({
            name: optionalString(),
            issueDate: optionalString(),
            validUntil: optionalString(),
            issuedBy: optionalString(),
        })).optional(),
        recognitions: z.array(z.string()).optional(),
    }).optional(),

    // Social impact
    socialImpact: z.object({
        volunteering: z.array(z.object({
            project: optionalString(),
            participants: optionalNumber(0),
            hoursPerMonth: optionalNumber(0),
            coordinator: optionalString(),
            description: optionalString(),
            frequency: optionalString(),
            duration: optionalString(),
        })).optional(),
        communityProjects: z.array(z.object({
            name: optionalString(),
            description: optionalString(),
            beneficiaries: optionalNumber(0),
            status: optionalEnum(['активен', 'завършен', 'планиран', 'спрян', 'сезонен'], 'Invalid project status'),
            budget: optionalNumber(0),
        })).optional(),
        partnerships: z.array(z.object({
            partner: optionalString(),
            type: optionalEnum(['социално', 'образователно', 'здравно', 'културно', 'спортно', 'благотворително'], 'Invalid partnership type'),
            description: optionalString(),
        })).optional(),
    }).optional(),

    // Pensioner-specific features
    pensionersSpecific: z.object({
        healthServices: z.object({
            regularCheckups: z.boolean().optional(),
            bloodPressureMonitoring: z.boolean().optional(),
            healthLectures: z.array(z.object({
                topic: optionalString(),
                lecturer: optionalString(),
                frequency: optionalEnum(['дневно', 'седмично', 'двуседмично', 'месечно', 'тримесечно', 'годишно', '24/7'], 'Invalid frequency'),
                nextDate: optionalString(),
                duration: optionalString(),
            })).optional(),
            medicalPartners: z.array(z.object({
                name: optionalString(),
                service: optionalString(),
                contact: optionalString(),
                address: optionalString(),
                workingHours: optionalString(),
                discount: optionalString(),
            })).optional(),
            emergencyProtocol: z.object({
                hasEmergencyPlan: z.boolean().optional(),
                emergencyContacts: z.array(z.string()).optional(),
                nearestHospital: optionalString(),
                specialNeeds: z.array(z.string()).optional(),
            }).optional(),
        }).optional(),

        supportServices: z.object({
            homeVisits: z.boolean().optional(),
            shoppingAssistance: z.boolean().optional(),
            documentHelp: z.boolean().optional(),
            companionship: z.boolean().optional(),
            transportService: z.boolean().optional(),
            mealDelivery: z.boolean().optional(),
            cleaningHelp: z.boolean().optional(),
            techSupport: z.boolean().optional(),
        }).optional(),

        accessibility: z.object({
            wheelchairAccess: z.boolean().optional(),
            elevatorAccess: z.boolean().optional(),
            hearingLoop: z.boolean().optional(),
            largeTextMaterials: z.boolean().optional(),
            handrails: z.boolean().optional(),
            nonSlipFloors: z.boolean().optional(),
            goodLighting: z.boolean().optional(),
            restingAreas: z.boolean().optional(),
        }).optional(),

        specialPrograms: z.object({
            memoryActivities: z.array(z.object({
                name: optionalString(),
                frequency: optionalEnum(['дневно', 'седмично', 'месечно', 'два пъти седмично', 'три пъти седмично'], 'Invalid frequency'),
                description: optionalString(),
                instructor: optionalString(),
                participants: optionalNumber(0),
            })).optional(),
            intergenerationalPrograms: z.array(z.object({
                name: optionalString(),
                description: optionalString(),
                frequency: optionalString(),
                participants: optionalNumber(0),
                ageRange: optionalString(),
                coordinator: optionalString(),
                venue: optionalString(),
            })).optional(),
            volunteerPrograms: z.array(z.object({
                name: optionalString(),
                volunteers: optionalNumber(0),
                coordinator: optionalString(),
                description: optionalString(),
                hoursPerWeek: optionalNumber(0),
                training: optionalString(),
            })).optional(),
            mentalHealthSupport: z.array(z.object({
                type: optionalEnum(['индивидуална', 'групова', 'семейна', 'кризисна интервенция', 'подкрепителни групи', 'спортна психология'], 'Invalid support type'),
                frequency: optionalString(),
                therapist: optionalString(),
                participants: optionalNumber(0),
                focus: optionalString(),
                availability: optionalString(),
                contact: optionalString(),
            })).optional(),
        }).optional(),

        ageSpecificNeeds: z.object({
            lowImpactActivities: z.array(z.object({
                name: optionalString(),
                intensity: optionalEnum(['ниска', 'средна', 'висока', 'ниска до средна'], 'Invalid intensity'),
                suitableFor: z.array(z.string()).optional(),
                duration: optionalString(),
            })).optional(),
            cognitiveStimulation: z.array(z.string()).optional(),
            socialIsolationPrevention: z.array(z.string()).optional(),
            nutritionSupport: z.array(z.object({
                service: optionalString(),
                provider: optionalString(),
                frequency: optionalString(),
                price: optionalString(),
                coverage: optionalString(),
                volunteers: optionalNumber(0),
            })).optional(),
            medicationReminders: z.boolean().optional(),
            fallPrevention: z.array(z.string()).optional(),
        }).optional(),
    }).optional(),

    // Template and preferences
    template: optionalEnum(['cultural', 'sports', 'traditional', 'social', 'educational', 'active', 'general'], 'Invalid template'),

    preferences: z.object({
        showFinances: z.boolean().optional(),
        showMembersList: z.boolean().optional(),
        allowOnlineRegistration: z.boolean().optional(),
        showContactForm: z.boolean().optional(),
        enableCalendar: z.boolean().optional(),
        showTestimonials: z.boolean().optional(),
        publicGallery: z.boolean().optional(),
        showStatistics: z.boolean().optional(),
        allowComments: z.boolean().optional(),
        showNewsSection: z.boolean().optional(),
    }).optional(),
});

module.exports = detailsSchema;
