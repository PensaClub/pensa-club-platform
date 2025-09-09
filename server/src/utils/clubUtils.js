const { forwardEmailsViaZoho } = require('./zohoEmails');
const CustomError = require('./customError');

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
        owner: club.owner || '',

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
                    emergencyContact: data.emergencyContact || '',
                });
                break;
            case 'trips':
                transformed.trips.push({
                    destination: data.destination || '',
                    date: data.date || '',
                    participants: data.participants || 0,
                    price: data.price || 0,
                    description: activityData.description || '',
                    emergencyContact: data.emergencyContact || '',
                });
                break;
            case 'courses':
                transformed.courses.push({
                    name: activityData.name || '',
                    duration: data.duration || '',
                    participants: data.participants || 0,
                    instructor: data.instructor || '',
                    description: activityData.description || '',
                    emergencyContact: data.emergencyContact || '',
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

const processClubAdminAction = async (club, action, options, adminEmail) => {
    const { status, reason, customMessage } = options;

    const statusTranslations = {
        active: 'активен',
        inactive: 'неактивен',
        suspended: 'спрян',
        rejected: 'отхвърлен',
    };

    const clubLink = `${process.env.FRONTEND_SERVER}/clubs/${club.slug}`;
    const clubLinkMessage = `<br><br>Посетете клуба тук: <a href="${clubLink}" style="color: #1a73e8; text-decoration: underline;">${clubLink}</a>`;

    let updateData = {};
    let emailMessage = '';
    let emailSubject = '';

    switch (action) {
        case 'toggle-status':
            if (!status) {
                throw new CustomError({
                    message: 'Status is required for toggle-status action',
                    statusCode: 400,
                });
            }

            const statusText = statusTranslations[status] || status;
            updateData = { status };
            emailSubject = `Промяна на статуса на клуб "${club.name}"`;
            emailMessage = customMessage || `Статусът на вашия клуб "${club.name}" беше променен на ${statusText}.`;

            if (status === 'active') {
                emailMessage += clubLinkMessage;
            }
            break;

        case 'verify':
            updateData = { isVerified: true };
            emailSubject = `Потвърждение на клуб "${club.name}"`;
            emailMessage = customMessage || `Поздравления! Вашият клуб "${club.name}" беше потвърден от нашия екип.`;
            emailMessage += clubLinkMessage;
            break;

        case 'approve':
            updateData = { status: 'active', isVerified: true };
            emailSubject = `Одобрение на клуб "${club.name}"`;
            emailMessage = customMessage || `Отлични новини! Вашият клуб "${club.name}" беше одобрен и вече е активен в нашата платформа.`;
            emailMessage += clubLinkMessage;
            break;

        case 'reject':
            if (!reason) {
                throw new CustomError({
                    message: 'Reason is required for rejection',
                    statusCode: 400,
                });
            }
            updateData = { status: 'rejected' };
            emailSubject = `Отхвърляне на заявка за клуб "${club.name}"`;
            emailMessage =
                customMessage ||
                `Съжаляваме да ви информираме, че заявката ви за клуб "${club.name}" беше отхвърлена.<br><br>Причина: ${reason}<br><br>Моля, прегледайте обратната връзка и не се колебайте да подадете отново с необходимите промени.`;
            break;

        case 'delete':
            updateData = null;
            emailSubject = `Изтриване на клуб "${club.name}"`;
            emailMessage = customMessage || `Вашият клуб "${club.name}" беше изтрит поради неактивност. За повече информация, моля свържете се с нас.`;
            break;

        default:
            throw new CustomError({
                message: 'Invalid action',
                statusCode: 400,
            });
    }

    // Send email
    try {
        await forwardEmailsViaZoho({
            userEmail: adminEmail,
            subject: emailSubject,
            body: emailMessage,
            toAddresses: club.owner,
        });
        return { updateData, emailSent: true };
    } catch (emailError) {
        try {
            await forwardEmailsViaZoho({
                userEmail: adminEmail,
                subject: `EMAIL FAILED - ${emailSubject}`,
                body: `Failed to send email to club owner ${club.owner} for club "${club.name}". Original message: ${emailMessage}`,
                toAddresses: 'admin@pensa.club',
            });
        } catch (fallbackError) {
            console.error('Failed to send fallback email notification:', fallbackError);
        }
        return { updateData, emailSent: false, emailError: emailError.message };
    }
};

const translateExperience = (experience) => {
    const translations = {
        none: 'Без опит',
        beginner: 'Начинаещ',
        intermediate: 'Среднонапреднал',
        advanced: 'Напреднал',
    };
    return translations[experience] || experience;
};

const handleMailingFormEmail = async (club, formType, validatedData, activityTitle = null) => {
    try {
        let emailTitle;
        let mainInfoContent;
        let messageContent;

        switch (formType) {
            case 'contact':
                emailTitle = 'Контактна форма';
                mainInfoContent = `
                    <p><strong>Име:</strong> ${validatedData.name || '—'}</p>
                    <p><strong>Имейл:</strong> <a href="mailto:${validatedData.email || ''}" style="color: #0066cc; text-decoration: underline;">${
                    validatedData.email || '—'
                }</a></p>
                    ${validatedData.phone ? `<p><strong>Телефон:</strong> ${validatedData.phone}</p>` : ''}
                    <p><strong>Предпочитан начин за контакт:</strong> ${validatedData.preferredContact || '—'}</p>
                `;
                messageContent = `
                    <p>${validatedData.message || '—'}</p>
                `;
                break;

            case 'membership':
                emailTitle = 'Кандидатстване за членство';
                mainInfoContent = `
                    <p><strong>Име:</strong> ${validatedData.name || '—'}</p>
                    <p><strong>Имейл:</strong> <a href="mailto:${validatedData.email || ''}" style="color: #0066cc; text-decoration: underline;">${
                    validatedData.email || '—'
                }</a></p>
                    ${validatedData.phone ? `<p><strong>Телефон:</strong> ${validatedData.phone}</p>` : ''}
                    ${validatedData.age ? `<p><strong>Възраст:</strong> ${validatedData.age}</p>` : ''}
                    ${validatedData.address ? `<p><strong>Адрес:</strong> ${validatedData.address}</p>` : ''}
                    ${validatedData.experience ? `<p><strong>Опит:</strong> ${translateExperience(validatedData.experience)}</p>` : ''}
                `;
                messageContent = `
                    <p><strong>Мотивация:</strong></p>
                    <p>${validatedData.motivation || '—'}</p>
                `;
                break;

            case 'volunteer':
                emailTitle = 'Кандидатстване за доброволчество';
                mainInfoContent = `
                    <p><strong>Име:</strong> ${validatedData.name || '—'}</p>
                    <p><strong>Имейл:</strong> <a href="mailto:${validatedData.email || ''}" style="color: #0066cc; text-decoration: underline;">${
                    validatedData.email || '—'
                }</a></p>
                    ${validatedData.phone ? `<p><strong>Телефон:</strong> ${validatedData.phone}</p>` : ''}
                    <p><strong>Умения:</strong> ${validatedData.skills || '—'}</p>
                    <p><strong>Наличност:</strong> ${validatedData.availability || '—'}</p>
                `;
                messageContent = `
                    <p><strong>Мотивация:</strong></p>
                    <p>${validatedData.motivation || '—'}</p>
                `;
                break;

            case 'partnership':
                emailTitle = 'Запитване за партньорство';
                mainInfoContent = `
                    <p><strong>Организация:</strong> ${validatedData.organizationName || '—'}</p>
                    <p><strong>Лице за контакт:</strong> ${validatedData.contactPerson || '—'}</p>
                    <p><strong>Имейл:</strong> <a href="mailto:${validatedData.email || ''}" style="color: #0066cc; text-decoration: underline;">${
                    validatedData.email || '—'
                }</a></p>
                    ${validatedData.phone ? `<p><strong>Телефон:</strong> ${validatedData.phone}</p>` : ''}
                    <p><strong>Тип на предложението:</strong> ${validatedData.proposalType || '—'}</p>
                `;
                messageContent = `
                    <p><strong>Описание:</strong></p>
                    <p>${validatedData.description || '—'}</p>
                `;
                break;

            case 'sponsorship':
                emailTitle = 'Запитване за спонсорство';
                mainInfoContent = `
                    <p><strong>Компания:</strong> ${validatedData.companyName || '—'}</p>
                    <p><strong>Лице за контакт:</strong> ${validatedData.contactPerson || '—'}</p>
                    <p><strong>Имейл:</strong> <a href="mailto:${validatedData.email || ''}" style="color: #0066cc; text-decoration: underline;">${
                    validatedData.email || '—'
                }</a></p>
                    ${validatedData.phone ? `<p><strong>Телефон:</strong> ${validatedData.phone}</p>` : ''}
                    <p><strong>Тип на спонсорството:</strong> ${validatedData.sponsorshipType || '—'}</p>
                    ${validatedData.amount ? `<p><strong>Сума:</strong> ${validatedData.amount}</p>` : ''}
                `;
                messageContent = `
                    <p><strong>Описание:</strong></p>
                    <p>${validatedData.description || '—'}</p>
                `;
                break;

            case 'event':
                emailTitle = 'Записване за събитие';
                mainInfoContent = `
                    <p><strong>Събитие:</strong> ${activityTitle}</p>
                    <p><strong>Име:</strong> ${validatedData.name || '—'}</p>
                    <p><strong>Имейл:</strong> <a href="mailto:${validatedData.email || ''}" style="color: #0066cc; text-decoration: underline;">${
                    validatedData.email || '—'
                }</a></p>
                    ${validatedData.phone ? `<p><strong>Телефон:</strong> ${validatedData.phone}</p>` : ''}
                    ${validatedData.numberOfParticipants ? `<p><strong>Брой участници:</strong> ${validatedData.numberOfParticipants}</p>` : ''}
                    ${validatedData.emergencyContact ? `<p><strong>Спешен контакт:</strong> ${validatedData.emergencyContact}</p>` : ''}
                `;
                messageContent = `
                    <p><strong>Специални искания:</strong></p>
                    <p>${validatedData.specialRequests || '—'}</p>
                `;
                break;

            case 'course':
                emailTitle = 'Записване за курс';
                mainInfoContent = `
                    <p><strong>Курс:</strong> ${activityTitle}</p>
                    <p><strong>Име:</strong> ${validatedData.name || '—'}</p>
                    <p><strong>Имейл:</strong> <a href="mailto:${validatedData.email || ''}" style="color: #0066cc; text-decoration: underline;">${
                    validatedData.email || '—'
                }</a></p>
                    ${validatedData.phone ? `<p><strong>Телефон:</strong> ${validatedData.phone}</p>` : ''}
                    ${validatedData.experience ? `<p><strong>Опит:</strong> ${translateExperience(validatedData.experience)}</p>` : ''}
                    ${validatedData.emergencyContact ? `<p><strong>Спешен контакт:</strong> ${validatedData.emergencyContact}</p>` : ''}
                `;
                messageContent = `
                    <p><strong>Очаквания:</strong></p>
                    <p>${validatedData.expectations || '—'}</p>
                `;
                break;

            case 'trip':
                emailTitle = 'Записване за екскурзия';
                mainInfoContent = `
                    <p><strong>Екскурзия:</strong> ${activityTitle}</p>
                    <p><strong>Име:</strong> ${validatedData.name || '—'}</p>
                    <p><strong>Имейл:</strong> <a href="mailto:${validatedData.email || ''}" style="color: #0066cc; text-decoration: underline;">${
                    validatedData.email || '—'
                }</a></p>
                    ${validatedData.phone ? `<p><strong>Телефон:</strong> ${validatedData.phone}</p>` : ''}
                    ${validatedData.numberOfParticipants ? `<p><strong>Брой участници:</strong> ${validatedData.numberOfParticipants}</p>` : ''}
                    ${validatedData.emergencyContact ? `<p><strong>Спешен контакт:</strong> ${validatedData.emergencyContact}</p>` : ''}
                `;
                messageContent = `
                    <p><strong>Специални искания:</strong></p>
                    <p>${validatedData.specialRequests || '—'}</p>
                `;
                break;

            default:
                throw new Error('Invalid form type');
        }

        const customFormattedBody = `
            <html>
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f9f9f9;">
                    <div style="background: #fff; padding: 10px; border-radius: 8px; margin: 0; max-width: 100%;">
                        <h2 style="color: #222; margin: 0 0 12px 0; text-align: center;">${emailTitle}</h2>
                        <p style="color: #222; font-size: 16px; margin: 0 0 8px 0; text-align: center; font-weight: 500;">Клуб: <strong style="color: #000;">${
                            club.name
                        }</strong></p>
                        ${
                            formType === 'contact'
                                ? `<p style="color: #222; font-size: 16px; margin: 0 0 12px 0; text-align: center; font-weight: 500;">Тема: <strong style="color: #000;">${
                                      validatedData.subject || 'Без тема'
                                  }</strong></p>`
                                : ''
                        }

                        <table cellpadding="0" cellspacing="0" style="margin: 0 0 8px 0; width: 100%;">
                            <tr>
                                <td width="8" style="background: linear-gradient(to bottom, #f47920, #2986c7); background-color: #f47920; border-radius: 4px;">&nbsp;</td>
                                <td style="padding: 4px 0 4px 12px; color: #222; font-size: 18px; font-weight: bold;">Основна Информация:</td>
                            </tr>
                        </table>
                        <div style="background: #f7f7f7; padding: 8px; border-radius: 6px; color: #222; font-size: 16px; line-height: 1.2; max-height: 300px; overflow-y: auto; word-break: break-word; margin-bottom: 12px;">
                            ${mainInfoContent}
                        </div>

                        <table cellpadding="0" cellspacing="0" style="margin: 0 0 8px 0; width: 100%;">
                            <tr>
                                <td width="8" style="background: linear-gradient(to bottom, #f47920, #2986c7); background-color: #f47920; border-radius: 4px;">&nbsp;</td>
                                <td style="padding: 4px 0 4px 12px; color: #222; font-size: 18px; font-weight: bold;">Съобщение:</td>
                            </tr>
                        </table>
                        <div style="background: #f7f7f7; padding: 8px; border-radius: 6px; color: #222; font-size: 16px; line-height: 1.2; max-height: 300px; overflow-y: auto; word-break: break-word;">
                            ${messageContent}
                        </div>
                    </div>
                </body>
            </html>
        `;

        // Send email
        try {
            const recipientEmail = club.details?.contacts?.email;

            if (!recipientEmail) {
                throw new Error('Club contact email not found');
            }

            await forwardEmailsViaZoho({
                userEmail: 'info@pensa.club',
                subject: `${emailTitle} - ${club.name}`,
                body: messageContent,
                // toAddresses: recipientEmail,
                toAddresses: 'atm0sphar3zlalz@gmail.com',
                formattedBody: customFormattedBody,
            });
            return { emailSent: true };
        } catch (emailError) {
            try {
                await forwardEmailsViaZoho({
                    userEmail: 'info@pensa.club',
                    subject: `EMAIL FAILED - ${emailTitle} - ${club.name}`,
                    body: `Failed to send email to club contact ${club.details?.contacts?.email} for club "${club.name}". Original message: ${messageContent}`,
                    toAddresses: 'admin@pensa.club',
                });
            } catch (fallbackError) {
                console.error('Failed to send fallback email notification:', fallbackError);
            }
            return { emailSent: false, emailError: emailError.message };
        }
    } catch (err) {
        return { emailSent: false, emailError: err.message };
    }
};

const handlePersonalEmail = async (emailData) => {
    try {
        const { from, to, subject, message } = emailData;

        const customFormattedBody = `
            <html>
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f9f9f9;">
                    <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 0; max-width: 100%;">
                        <div style="display: flex; align-items: center; margin-bottom: 20px;">
                            <div style="width: 6px; height: 40px; background: linear-gradient(to bottom, #f47920, #2986c7); border-radius: 3px; margin-right: 12px;"></div>
                            <div>
                                <h2 style="color: #222; margin: 0; font-size: 24px; font-weight: bold;">${subject || 'Без тема'}</h2>
                            </div>
                        </div>

                        <div style="background: #f7f7f7; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
                            <p style="color: #222; margin: 0 0 8px 0; font-size: 16px;"><strong>От:</strong> <a href="mailto:${
                                from || ''
                            }" style="color: #0066cc; text-decoration: underline;">${from || '—'}</a></p>
                        </div>

                        <div style="background: #f7f7f7; padding: 16px; border-radius: 6px;">
                            <p style="color: #222; margin: 0; font-size: 16px; line-height: 1.5; white-space: pre-wrap;">${message || '—'}</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        // Send email
        try {
            await forwardEmailsViaZoho({
                userEmail: 'info@pensa.club',
                subject: `Лично съобщение: ${subject || 'Без тема'}`,
                body: message,
                toAddresses: to,
                formattedBody: customFormattedBody,
            });
            return { emailSent: true };
        } catch (emailError) {
            try {
                await forwardEmailsViaZoho({
                    userEmail: 'info@pensa.club',
                    subject: `EMAIL FAILED - Лично съобщение`,
                    body: `Failed to send personal email from ${from} to ${to}. Original message: ${message}`,
                    toAddresses: 'admin@pensa.club',
                });
            } catch (fallbackError) {
                console.error('Failed to send fallback email notification:', fallbackError);
            }
            return { emailSent: false, emailError: emailError.message };
        }
    } catch (err) {
        return { emailSent: false, emailError: err.message };
    }
};

module.exports = {
    transformToDB,
    transformClub,
    transformMemberToDB,
    transformActivityToDB,
    processClubAdminAction,
    handleMailingFormEmail,
    handlePersonalEmail,
};
