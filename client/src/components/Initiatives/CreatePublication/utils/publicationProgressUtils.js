// publicationProgressUtils.js
import { getSlateTextLength } from '../../CreateIniciative/Utils/slateUtils.js.js';

/**
 * Calculates the overall progress of the publication form
 * @param {Object} values - Form values
 * @returns {number} - Progress percentage (0-100)
 */
export const calculatePublicationProgress = (values) => {
    if (!values) return 0;

    const progressBreakdown = getPublicationProgressBreakdown(values);
    const totalWeight = Object.values(progressBreakdown).reduce((sum, section) => sum + section.weight, 0);

    const weightedProgress = Object.values(progressBreakdown).reduce((sum, section) => {
        return sum + (section.progress * section.weight);
    }, 0);

    return Math.round(weightedProgress / totalWeight);
};

/**
 * Gets detailed progress breakdown for each section
 * @param {Object} values - Form values
 * @returns {Object} - Progress breakdown object
 */
export const getPublicationProgressBreakdown = (values) => {
    return {
        basicInfo: {
            label: 'Basic Info',
            progress: calculateBasicInfoProgress(values),
            weight: 0.4, // 40% weight
            fields: ['title', 'slug', 'shortDescription', 'category', 'readTime', 'tags']
        },
        content: {
            label: 'Content',
            progress: calculateContentProgress(values),
            weight: 0.4, // 40% weight
            fields: ['sections', 'image']
        },
        file: {
            label: 'File',
            progress: calculateFileProgress(values),
            weight: 0.15, // 15% weight
            fields: ['fileType', 'fileSize', 'downloadUrl']
        },
        settings: {
            label: 'Settings',
            progress: calculateSettingsProgress(values),
            weight: 0.05, // 5% weight
            fields: ['commentsEnabled']
        }
    };
};

/**
 * Calculates progress for Basic Info section
 * @param {Object} values - Form values
 * @returns {number} - Progress percentage (0-100)
 */
const calculateBasicInfoProgress = (values) => {
    const fields = [
        { key: 'title', required: true },
        { key: 'slug', required: true },
        { key: 'shortDescription', required: true },
        { key: 'category', required: false },
        { key: 'readTime', required: false },
        { key: 'tags', required: false, isArray: true }
    ];

    let completed = 0;
    let total = 0;

    fields.forEach(field => {
        total++;

        if (field.isArray) {
            if (values[field.key] && values[field.key].length > 0) {
                completed++;
            }
        } else if (field.required) {
            if (values[field.key] && values[field.key].toString().trim()) {
                completed++;
            }
        } else {
            // Optional field - give partial credit if filled
            if (values[field.key] && values[field.key].toString().trim()) {
                completed += 0.5;
            }
        }
    });

    return Math.round((completed / total) * 100);
};

/**
 * Calculates progress for Content section
 * @param {Object} values - Form values
 * @returns {number} - Progress percentage (0-100)
 */
const calculateContentProgress = (values) => {
    let completed = 0;
    let total = 2; // image + sections

    // Check main image
    if (values.image && values.image.src) {
        completed++;
    }

    // Check sections
    if (values.sections && values.sections.length > 0) {
        const validSections = values.sections.filter(section =>
            section.title && section.title.trim() &&
            section.content && getSlateTextLength(section.content) > 0
        );

        if (validSections.length > 0) {
            completed++;
        }
    }

    return Math.round((completed / total) * 100);
};

/**
 * Calculates progress for File section
 * @param {Object} values - Form values
 * @returns {number} - Progress percentage (0-100)
 */
const calculateFileProgress = (values) => {
    const fields = ['fileType', 'fileSize', 'downloadUrl'];
    let completed = 0;

    fields.forEach(field => {
        if (values[field] && values[field].toString().trim()) {
            completed++;
        }
    });

    return Math.round((completed / fields.length) * 100);
};

/**
 * Calculates progress for Settings section
 * @param {Object} values - Form values
 * @returns {number} - Progress percentage (0-100)
 */
const calculateSettingsProgress = (values) => {
    // Settings section should start at 0% and only be complete when user interacts with it
    // For now, return 0% until we have actual settings to validate
    return 0;
};

/**
 * Gets progress status text
 * @param {number} progress - Progress percentage
 * @returns {string} - Status text
 */
export const getPublicationProgressStatus = (progress) => {
    if (progress === 0) return 'Not Started';
    if (progress < 25) return 'Just Started';
    if (progress < 50) return 'In Progress';
    if (progress < 75) return 'Almost Complete';
    if (progress < 100) return 'Nearly Done';
    return 'Complete';
};

/**
 * Gets progress color based on percentage
 * @param {number} progress - Progress percentage
 * @returns {string} - CSS color
 */
export const getPublicationProgressColor = (progress) => {
    if (progress < 25) return '#dc2626'; // Red
    if (progress < 50) return '#f59e0b'; // Orange
    if (progress < 75) return '#3b82f6'; // Blue
    if (progress < 100) return '#8b5cf6'; // Purple
    return '#10b981'; // Green
};
