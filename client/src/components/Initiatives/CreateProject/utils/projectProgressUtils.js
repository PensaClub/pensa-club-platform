// utils/projectProgressUtils.js

/**
 * Calculate overall project form progress
 * @param {Object} values - Form values
 * @returns {number} - Progress percentage (0-100)
 */
// components/Projects/CreateProject/utils/projectProgressUtils.js
export const calculateProjectProgress = (values) => {
    let completedSections = 0;
    const totalSections = 9; // Total number of form sections

    // Basic Info (25%)
    if (values.title && values.slug && values.shortDescription && values.mainImage?.src) {
        completedSections += 2.5;
    } else if (values.title || values.slug || values.shortDescription) {
        completedSections += 1;
    }

    // Initiative Link (10%)
    if (values.initiativeId) {
        completedSections += 1;
    }

    // Budget & Timeline (15%)
    if (values.budget?.goal || values.timeline?.startDate || values.timeline?.endDate) {
        completedSections += 1;
        if (values.budget?.goal && values.timeline?.startDate && values.timeline?.endDate) {
            completedSections += 0.5;
        }
    }

    // Application (10%)
    if (values.applicationStatus || values.applicationDeadline || values.maxParticipants) {
        completedSections += 1;
    }

    // Sections (15%)
    if (values.sections && values.sections.length > 0) {
        const validSections = values.sections.filter(section => 
            section.title && section.content && 
            !(section.content.length === 1 && section.content[0].children?.length === 1 && !section.content[0].children[0].text?.trim())
        );
        if (validSections.length > 0) {
            completedSections += 1.5;
        }
    }

    // Team (10%)
    if (values.team && values.team.length > 0) {
        const validMembers = values.team.filter(member => member.name && member.role);
        if (validMembers.length > 0) {
            completedSections += 1;
        }
    }

    // Partners & Sponsors (5%)
    if ((values.partners && values.partners.length > 0) || (values.sponsors && values.sponsors.length > 0)) {
        completedSections += 0.5;
    }

    // Media (5%)
    if (values.logo || (values.gallery && values.gallery.length > 0)) {
        completedSections += 0.5;
    }

    // Contact (5%)
    if (values.contact?.name || values.contact?.email) {
        completedSections += 0.5;
    }

    return Math.min(Math.round((completedSections / totalSections) * 100), 100);
};

export const getProjectProgressBreakdown = (values) => {
    return {
        basicInfo: !!(values.title && values.slug && values.shortDescription && values.mainImage?.src),
        budget: !!(values.budget?.goal || values.timeline?.startDate || values.timeline?.endDate),
        application: !!(values.applicationStatus || values.applicationDeadline || values.maxParticipants),
        sections: !!(values.sections && values.sections.length > 0 && 
                    values.sections.some(section => section.title && section.content)),
        team: !!(values.team && values.team.length > 0 && 
                 values.team.some(member => member.name && member.role)),
        media: !!(values.logo || (values.gallery && values.gallery.length > 0)),
    };
};

const checkBasicInfo = (values) => {
    // Required fields
    const hasTitle = !!values.title?.trim();
    const hasSlug = !!values.slug?.trim();
    const hasMainImage = !!values.mainImage?.src?.trim();
    
    // Optional but recommended
    const hasDescription = !!values.shortDescription?.trim() || 
                         (values.fullDescription && values.fullDescription.length > 0);
    const hasCategory = !!values.category;
    const hasLocation = values.location?.[0]?.address || 
                       (values.location?.[0]?.coordinates?.lat && values.location?.[0]?.coordinates?.lng);
    
    // At least required fields + 2 optional
    const optionalCount = [hasDescription, hasCategory, hasLocation].filter(Boolean).length;
    
    return hasTitle && hasSlug && hasMainImage && optionalCount >= 2;
};

/**
 * Check if budget info is complete
 */
const checkBudget = (values) => {
    const hasBudgetGoal = values.budget?.goal > 0;
    const hasBudgetTotal = values.budget?.total > 0;
    const hasCurrency = !!values.budget?.currency;
    
    // Partners or sponsors count as budget progress
    const hasPartners = values.partners?.length > 0;
    const hasSponsors = values.sponsors?.length > 0;
    
    // Need at least some budget info OR funding partners
    return (hasBudgetGoal && hasCurrency) || hasPartners || hasSponsors;
};

/**
 * Check if timeline is complete
 */
const checkTimeline = (values) => {
    const hasStartDate = !!values.timeline?.startDate;
    const hasEndDate = !!values.timeline?.endDate;
    const hasMilestones = values.milestones?.length > 0;
    
    // Valid date range
    const hasValidDates = hasStartDate && hasEndDate && 
                         new Date(values.timeline.startDate) < new Date(values.timeline.endDate);
    
    return hasValidDates || (hasStartDate && hasMilestones);
};

/**
 * Check if application settings are complete
 */
const checkApplication = (values) => {
    const hasApplicationStatus = !!values.applicationStatus;
    const hasDeadline = !!values.applicationDeadline;
    const hasMaxParticipants = values.maxParticipants > 0;
    const hasRequirements = values.participantRequirements?.length > 0;
    
    // If application is open, need more details
    if (values.applicationStatus === 'open') {
        return hasApplicationStatus && hasDeadline && hasMaxParticipants;
    }
    
    // Otherwise just status is enough
    return hasApplicationStatus;
};

/**
 * Check if sections are complete
 */
const checkSections = (values) => {
    if (!values.sections || values.sections.length === 0) {
        return false;
    }
    
    // At least one complete section
    return values.sections.some(section => {
        const hasTitle = !!section.title?.trim();
        const hasContent = section.content && Array.isArray(section.content) && 
                          section.content.length > 0 &&
                          section.content.some(node => {
                              if (node.children) {
                                  return node.children.some(child => child.text?.trim());
                              }
                              return node.text?.trim();
                          });
        
        return hasTitle && hasContent;
    });
};

/**
 * Check if team info is complete
 */
const checkTeam = (values) => {
    if (!values.team || values.team.length === 0) {
        return false;
    }
    
    // At least one team member with name and role
    return values.team.some(member => 
        member.name?.trim() && 
        (member.role?.trim() || member.email?.trim() || member.phone?.trim())
    );
};

/**
 * Check if media is complete
 */
const checkMedia = (values) => {
    const hasLogo = !!values.logo;
    const hasDownloadMaterials = values.downloadMaterials?.length > 0;
    const hasGallery = values.mainImage?.gallery?.length > 0;
    
    // Any media content counts
    return hasLogo || hasDownloadMaterials || hasGallery;
};

/**
 * Check if contact info is complete
 */
const checkContact = (values) => {
    const hasContactName = !!values.contact?.name?.trim();
    const hasContactEmail = !!values.contact?.email?.trim();
    const hasContactPhone = !!values.contact?.phone?.trim();
    
    // Need at least name and one contact method
    return hasContactName && (hasContactEmail || hasContactPhone);
};

/**
 * Get section completion status with details
 * @param {Object} values - Form values
 * @returns {Object} - Detailed status for each section
 */
export const getDetailedProgress = (values) => {
    return {
        basicInfo: {
            complete: checkBasicInfo(values),
            details: {
                title: !!values.title?.trim(),
                slug: !!values.slug?.trim(),
                mainImage: !!values.mainImage?.src?.trim(),
                description: !!values.shortDescription?.trim() || 
                           (values.fullDescription && values.fullDescription.length > 0),
                category: !!values.category,
                location: values.location?.[0]?.address || 
                         (values.location?.[0]?.coordinates?.lat && values.location?.[0]?.coordinates?.lng)
            }
        },
        budget: {
            complete: checkBudget(values),
            details: {
                goal: values.budget?.goal > 0,
                total: values.budget?.total > 0,
                currency: !!values.budget?.currency,
                partners: values.partners?.length || 0,
                sponsors: values.sponsors?.length || 0
            }
        },
        timeline: {
            complete: checkTimeline(values),
            details: {
                startDate: !!values.timeline?.startDate,
                endDate: !!values.timeline?.endDate,
                validRange: values.timeline?.startDate && values.timeline?.endDate &&
                           new Date(values.timeline.startDate) < new Date(values.timeline.endDate),
                milestones: values.milestones?.length || 0
            }
        },
        application: {
            complete: checkApplication(values),
            details: {
                status: !!values.applicationStatus,
                deadline: !!values.applicationDeadline,
                maxParticipants: values.maxParticipants > 0,
                requirements: values.participantRequirements?.length || 0
            }
        },
        sections: {
            complete: checkSections(values),
            count: values.sections?.length || 0,
            completeSections: values.sections?.filter(section => 
                section.title?.trim() && section.content?.length > 0
            ).length || 0
        },
        team: {
            complete: checkTeam(values),
            count: values.team?.length || 0,
            completeMembers: values.team?.filter(member => 
                member.name?.trim() && (member.role?.trim() || member.email?.trim())
            ).length || 0
        },
        media: {
            complete: checkMedia(values),
            details: {
                logo: !!values.logo,
                downloads: values.downloadMaterials?.length || 0,
                gallery: values.mainImage?.gallery?.length || 0
            }
        },
        contact: {
            complete: checkContact(values),
            details: {
                name: !!values.contact?.name?.trim(),
                email: !!values.contact?.email?.trim(),
                phone: !!values.contact?.phone?.trim(),
                role: !!values.contact?.role?.trim()
            }
        }
    };
};

/**
 * Get next incomplete section
 * @param {Object} values - Form values
 * @returns {string|null} - Next section ID or null if all complete
 */
export const getNextIncompleteSection = (values) => {
    const breakdown = getProjectProgressBreakdown(values);
    const sectionOrder = [
        'basicInfo', 
        'budget', 
        'timeline', 
        'application', 
        'sections', 
        'team', 
        'media', 
        'contact'
    ];
    
    for (const section of sectionOrder) {
        if (!breakdown[section]) {
            return section;
        }
    }
    
    return null;
};

/**
 * Get completion message based on progress
 * @param {number} progress - Progress percentage
 * @returns {Object} - Message and type
 */
export const getProgressMessage = (progress) => {
    if (progress === 0) {
        return {
            type: 'start',
            message: 'Започнете с попълване на основната информация'
        };
    } else if (progress < 25) {
        return {
            type: 'early',
            message: 'Добро начало! Продължете с попълването'
        };
    } else if (progress < 50) {
        return {
            type: 'quarter',
            message: 'Напредвате добре! Още малко остава'
        };
    } else if (progress < 75) {
        return {
            type: 'half',
            message: 'Преполовихте формата! Продължавайте'
        };
    } else if (progress < 100) {
        return {
            type: 'almost',
            message: 'Почти готово! Довършете последните секции'
        };
    } else {
        return {
            type: 'complete',
            message: 'Браво! Формата е готова за изпращане'
        };
    }
};

/**
 * Check if form is ready for submission
 * @param {Object} values - Form values
 * @returns {Object} - Ready status and missing required fields
 */
export const checkReadyForSubmission = (values) => {
    const requiredFields = [];
    
    // Check required fields
    if (!values.title?.trim()) requiredFields.push('Заглавие');
    if (!values.slug?.trim()) requiredFields.push('URL адрес');
    if (!values.mainImage?.src?.trim()) requiredFields.push('Главна снимка');
    
    const isReady = requiredFields.length === 0;
    
    return {
        isReady,
        missingFields: requiredFields,
        progress: calculateProjectProgress(values)
    };
};