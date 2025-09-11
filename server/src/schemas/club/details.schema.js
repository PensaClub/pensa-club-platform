const { z } = require('zod');
const { optionalString, optionalNumber, optionalEnum } = require('./helpers');

const detailsSchema = z.object({
    id: z.string().optional(),
    clubId: z.string().optional(),

    fullDescription: optionalString(),

    // Media collections
    gallery: z.array(z.string()).optional(),

    media: z
        .object({
            videos: z
                .array(
                    z.object({
                        src: optionalString(),
                        alt: optionalString(),
                        caption: optionalString(),
                        type: optionalString(), // TODO: change to enum when FE values are finalized
                        duration: optionalString(),
                        thumbnail: optionalString(),
                    })
                )
                .optional(),
            virtualTour: optionalString(),
            audioFiles: z
                .array(
                    z.object({
                        src: optionalString(),
                        alt: optionalString(),
                        caption: optionalString(),
                        duration: optionalString(),
                    })
                )
                .optional(),
        })
        .optional(),

    // Statistics
    stats: z
        .object({
            totalMembers: optionalNumber(0),
            programs: optionalNumber(0),
            events: optionalNumber(0),
            performances: optionalNumber(0),
            yearsActive: optionalNumber(0),
            projectsBeneficiaries: optionalNumber(0),
            donationsDistributed: optionalNumber(0),
            competitions: optionalNumber(0),
            avgWeeklyWorkouts: optionalNumber(0),
        })
        .optional(),

    // Management information
    management: z
        .object({
            board: z
                .array(
                    z.object({
                        name: optionalString(),
                        role: optionalString(), // TODO: change to enum when FE values are finalized
                        phone: optionalString(),
                        email: optionalString(),
                        address: optionalString(),
                        avatar: optionalString(),
                        bio: optionalString(),
                    })
                )
                .optional(),
        })
        .optional(),

    // Contact information
    contacts: z
        .object({
            phone: optionalString(),
            mobile: optionalString(),
            email: optionalString(),
            website: optionalString(),
            socialMedia: z
                .object({
                    facebook: optionalString(),
                    instagram: optionalString(),
                    youtube: optionalString(),
                    twitter: optionalString(),
                    linkedin: optionalString(),
                })
                .optional(),
            workingHours: z
                .object({
                    monday: optionalString(),
                    tuesday: optionalString(),
                    wednesday: optionalString(),
                    thursday: optionalString(),
                    friday: optionalString(),
                    saturday: optionalString(),
                    sunday: optionalString(),
                    days: z
                        .object({
                            monday: z
                                .object({
                                    enabled: z.boolean().optional(),
                                    open: optionalString(),
                                    close: optionalString(),
                                })
                                .optional(),
                            tuesday: z
                                .object({
                                    enabled: z.boolean().optional(),
                                    open: optionalString(),
                                    close: optionalString(),
                                })
                                .optional(),
                            wednesday: z
                                .object({
                                    enabled: z.boolean().optional(),
                                    open: optionalString(),
                                    close: optionalString(),
                                })
                                .optional(),
                            thursday: z
                                .object({
                                    enabled: z.boolean().optional(),
                                    open: optionalString(),
                                    close: optionalString(),
                                })
                                .optional(),
                            friday: z
                                .object({
                                    enabled: z.boolean().optional(),
                                    open: optionalString(),
                                    close: optionalString(),
                                })
                                .optional(),
                            saturday: z
                                .object({
                                    enabled: z.boolean().optional(),
                                    open: optionalString(),
                                    close: optionalString(),
                                })
                                .optional(),
                            sunday: z
                                .object({
                                    enabled: z.boolean().optional(),
                                    open: optionalString(),
                                    close: optionalString(),
                                })
                                .optional(),
                        })
                        .optional(),
                    special: optionalString(),
                })
                .optional(),
            address: z
                .object({
                    street: optionalString(),
                    city: optionalString(),
                    postalCode: optionalString(),
                    poBox: optionalString(),
                })
                .optional(),
            people: z
                .array(
                    z.object({
                        id: optionalNumber(),
                        name: optionalString(),
                        role: optionalString(),
                        phone: optionalString(),
                        email: optionalString(),
                        description: optionalString(),
                    })
                )
                .optional(),
        })
        .optional(),

    // Financial information
    finances: z
        .object({
            budget: z
                .object({
                    yearly: optionalNumber(0),
                    currency: optionalString(), // TODO: change to enum when FE values are finalized
                })
                .optional(),
            funding: z
                .array(
                    z.object({
                        source: optionalString(),
                        amount: optionalNumber(0),
                        type: optionalString(), // TODO: change to enum when FE values are finalized
                    })
                )
                .optional(),
            sponsors: z
                .array(
                    z.object({
                        name: optionalString(),
                        contribution: optionalString(),
                        type: optionalString(), // TODO: change to enum when FE values are finalized
                        contact: optionalString(),
                        address: optionalString(),
                        website: optionalString(),
                        workingHours: optionalString(),
                        discount: optionalString(),
                        description: optionalString(),
                    })
                )
                .optional(),
        })
        .optional(),

    // Regional information
    regionalInfo: z
        .object({
            isCentralClub: z.boolean().optional(),
            centralClubId: optionalString(),
            affiliatedClubs: z.array(z.string()).optional(),
            coverageArea: optionalString(),
            regionalRole: optionalString(), // TODO: change to enum when FE values are finalized
        })
        .optional(),

    // Achievements and recognition
    achievements: z
        .object({
            awards: z
                .array(
                    z.object({
                        name: optionalString(),
                        year: optionalNumber(1900, new Date().getFullYear()),
                        awardedBy: optionalString(),
                        description: optionalString(),
                    })
                )
                .optional(),
            certificates: z
                .array(
                    z.object({
                        name: optionalString(),
                        issueDate: optionalString(),
                        validUntil: optionalString(),
                        issuedBy: optionalString(),
                    })
                )
                .optional(),
            recognitions: z.array(z.string()).optional(),
        })
        .optional(),

    // Social impact
    socialImpact: z
        .object({
            volunteering: z
                .array(
                    z.object({
                        project: optionalString(),
                        participants: optionalNumber(0),
                        hoursPerMonth: optionalNumber(0),
                        coordinator: optionalString(),
                        description: optionalString(),
                        frequency: optionalString(),
                        duration: optionalString(),
                    })
                )
                .optional(),
            communityProjects: z
                .array(
                    z.object({
                        name: optionalString(),
                        description: optionalString(),
                        beneficiaries: optionalNumber(0),
                        status: optionalString(), // TODO: change to enum when FE values are finalized
                        budget: optionalNumber(0),
                    })
                )
                .optional(),
            partnerships: z
                .array(
                    z.object({
                        partner: optionalString(),
                        type: optionalString(), // TODO: change to enum when FE values are finalized
                        description: optionalString(),
                    })
                )
                .optional(),
        })
        .optional(),

    // Pensioner-specific features
    pensionersSpecific: z
        .object({
            healthServices: z
                .object({
                    regularCheckups: z.boolean().optional(),
                    bloodPressureMonitoring: z.boolean().optional(),
                    healthLectures: z
                        .array(
                            z.object({
                                topic: optionalString(),
                                lecturer: optionalString(),
                                frequency: optionalString(), // TODO: change to enum when FE values are finalized
                                nextDate: optionalString(),
                                duration: optionalString(),
                            })
                        )
                        .optional(),
                    medicalPartners: z
                        .array(
                            z.object({
                                name: optionalString(),
                                service: optionalString(),
                                contact: optionalString(),
                                address: optionalString(),
                                workingHours: optionalString(),
                                discount: optionalString(),
                            })
                        )
                        .optional(),
                    emergencyProtocol: z
                        .object({
                            hasEmergencyPlan: z.boolean().optional(),
                            emergencyContacts: z.array(z.string()).optional(),
                            nearestHospital: optionalString(),
                            specialNeeds: z.array(z.string()).optional(),
                        })
                        .optional(),
                })
                .optional(),

            supportServices: z
                .object({
                    homeVisits: z.boolean().optional(),
                    shoppingAssistance: z.boolean().optional(),
                    documentHelp: z.boolean().optional(),
                    companionship: z.boolean().optional(),
                    transportService: z.boolean().optional(),
                    mealDelivery: z.boolean().optional(),
                    cleaningHelp: z.boolean().optional(),
                    techSupport: z.boolean().optional(),
                })
                .optional(),

            accessibility: z
                .object({
                    wheelchairAccess: z.boolean().optional(),
                    elevatorAccess: z.boolean().optional(),
                    hearingLoop: z.boolean().optional(),
                    largeTextMaterials: z.boolean().optional(),
                    handrails: z.boolean().optional(),
                    nonSlipFloors: z.boolean().optional(),
                    goodLighting: z.boolean().optional(),
                    restingAreas: z.boolean().optional(),
                })
                .optional(),

            specialPrograms: z
                .object({
                    memoryActivities: z
                        .array(
                            z.object({
                                name: optionalString(),
                                frequency: optionalString(), // TODO: change to enum when FE values are finalized
                                description: optionalString(),
                                instructor: optionalString(),
                                participants: optionalNumber(0),
                            })
                        )
                        .optional(),
                    intergenerationalPrograms: z
                        .array(
                            z.object({
                                name: optionalString(),
                                description: optionalString(),
                                frequency: optionalString(),
                                participants: optionalNumber(0),
                                ageRange: optionalString(),
                                coordinator: optionalString(),
                                venue: optionalString(),
                            })
                        )
                        .optional(),
                    volunteerPrograms: z
                        .array(
                            z.object({
                                name: optionalString(),
                                volunteers: optionalNumber(0),
                                coordinator: optionalString(),
                                description: optionalString(),
                                hoursPerWeek: optionalNumber(0),
                                training: optionalString(),
                            })
                        )
                        .optional(),
                    mentalHealthSupport: z
                        .array(
                            z.object({
                                type: optionalString(), // TODO: change to enum when FE values are finalized
                                frequency: optionalString(),
                                therapist: optionalString(),
                                participants: optionalNumber(0),
                                focus: optionalString(),
                                availability: optionalString(),
                                contact: optionalString(),
                            })
                        )
                        .optional(),
                })
                .optional(),

            ageSpecificNeeds: z
                .object({
                    lowImpactActivities: z
                        .array(
                            z.object({
                                name: optionalString(),
                                intensity: optionalString(), // TODO: change to enum when FE values are finalized
                                suitableFor: z.array(z.string()).optional(),
                                duration: optionalString(),
                            })
                        )
                        .optional(),
                    cognitiveStimulation: z.array(z.string()).optional(),
                    socialIsolationPrevention: z.array(z.string()).optional(),
                    nutritionSupport: z
                        .array(
                            z.object({
                                service: optionalString(),
                                provider: optionalString(),
                                frequency: optionalString(),
                                price: optionalString(),
                                coverage: optionalString(),
                                volunteers: optionalNumber(0),
                            })
                        )
                        .optional(),
                    medicationReminders: z.boolean().optional(),
                    fallPrevention: z.array(z.string()).optional(),
                })
                .optional(),
        })
        .optional(),

    // Template and preferences
    template: optionalString(), // TODO: change to enum when FE values are finalized

    preferences: z
        .object({
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
        })
        .optional(),
});

module.exports = detailsSchema;
