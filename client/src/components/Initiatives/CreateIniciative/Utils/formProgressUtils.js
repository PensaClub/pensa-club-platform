import { isSlateEmpty } from "./initiativeEditorUtils";

/**
 * Calculate overall form completion percentage
 * @param {Object} values - Form values
 * @returns {number} Progress percentage (0-100)
 */
export const calculateInitiativeProgress = (values) => {
    const sections = {
        basicInfo: {
            weight: 25,
            completed: 0
        },
        sections: {
            weight: 15,
            completed: 0
        },
        timeline: {
            weight: 10,
            completed: 0
        },
        targetScope: {
            weight: 15,
            completed: 0
        },
        resources: {
            weight: 15,
            completed: 0
        },
        media: {
            weight: 10,
            completed: 0
        },
        contacts: {
            weight: 10,
            completed: 0
        }
    };

    // Basic Info - check required fields
    const basicFields = ['title', 'shortDescription', 'category', 'detailedDescription'];
    const basicCompleted = basicFields.filter(field => {
        if (field === 'detailedDescription') {
            return values[field] && !isSlateEmpty(values[field]);
        }
        return values[field] && values[field].toString().trim();
    });
    sections.basicInfo.completed = (basicCompleted.length / basicFields.length) * sections.basicInfo.weight;

    // Sections
    if (values.sections?.length > 0 && values.sections.some(s => s.title && s.content)) {
        sections.sections.completed = sections.sections.weight;
    }

    // Timeline
    if (values.startDate && values.endDate) {
        sections.timeline.completed = sections.timeline.weight;
    }

    // Target Scope
    if (values.targetAge?.length > 0 || values.targetAudience?.length > 0) {
        sections.targetScope.completed = sections.targetScope.weight;
    }

    // Resources
    if (values.expectedBudget && values.partners?.length > 0) {
        sections.resources.completed = sections.resources.weight;
    }

    // Media
    if (values.mainImage?.src) {
        sections.media.completed = sections.media.weight;
    }

    // Contacts
    if (values.responsible?.name && values.responsible?.email) {
        sections.contacts.completed = sections.contacts.weight;
    }

    const totalProgress = Object.values(sections).reduce((sum, section) => sum + section.completed, 0);
    return Math.round(totalProgress);
};

/**
 * Check if basic info section is complete
 * @param {Object} values - Form values
 * @returns {boolean}
 */
export const isBasicInfoComplete = (values) => {
    const requiredFields = ['title', 'shortDescription', 'category', 'detailedDescription'];
    return requiredFields.every(field => {
        if (field === 'detailedDescription') {
            return values[field] && !isSlateEmpty(values[field]);
        }
        return values[field] && values[field].toString().trim();
    });
};

/**
 * Check if sections are complete
 * @param {Object} values - Form values
 * @returns {boolean}
 */
export const isSectionsComplete = (values) => {
    return values.sections?.length > 0 && values.sections.some(s => s.title && s.content);
};

/**
 * Check if timeline is complete
 * @param {Object} values - Form values
 * @returns {boolean}
 */
export const isTimelineComplete = (values) => {
    return values.startDate && values.endDate;
};

/**
 * Check if target scope is complete
 * @param {Object} values - Form values
 * @returns {boolean}
 */
export const isTargetScopeComplete = (values) => {
    return values.targetAge?.length > 0 || values.targetAudience?.length > 0;
};

/**
 * Check if resources section is complete
 * @param {Object} values - Form values
 * @returns {boolean}
 */
export const isResourcesComplete = (values) => {
    return values.expectedBudget && values.partners?.length > 0;
};

/**
 * Check if media section is complete
 * @param {Object} values - Form values
 * @returns {boolean}
 */
export const isMediaComplete = (values) => {
    return values.mainImage?.src;
};

/**
 * Check if contacts section is complete
 * @param {Object} values - Form values
 * @returns {boolean}
 */
export const isContactsComplete = (values) => {
    return values.responsible?.name && values.responsible?.email;
};

/**
 * Get detailed progress breakdown for all sections
 * @param {Object} values - Form values
 * @returns {Object} Section completion status
 */
export const getProgressBreakdown = (values) => {
    return {
        basicInfo: isBasicInfoComplete(values),
        sections: isSectionsComplete(values),
        timeline: isTimelineComplete(values),
        targetScope: isTargetScopeComplete(values),
        resources: isResourcesComplete(values),
        media: isMediaComplete(values),
        contacts: isContactsComplete(values)
    };
};