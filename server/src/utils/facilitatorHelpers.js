// Helpers for normalizing seminar_facilitator rows into a single shape.
// Used by API responses, exports (CSV/PDF), notification resolvers, etc.

/**
 * Given a seminar_facilitator Sequelize instance (with `mentor`, `adminUser`
 * + details, and `externalLecturer` eager-loaded), return a flat object with
 * consistent fields regardless of which of the 3 types the row is.
 *
 * @param {object} sf - seminar_facilitator plain object or model
 * @returns {object|null}
 */
function normalizeFacilitator(sf) {
    if (!sf) return null;
    const plain = typeof sf.get === 'function' ? sf.get({ plain: true }) : sf;

    const base = {
        id: plain.id,
        seminarFacilitatorId: plain.id,
        type: plain.facilitatorType || plain.facilitator_type,
        role: plain.role,
        isLead: plain.isLead ?? plain.is_lead ?? false,
        sortOrder: plain.sortOrder ?? plain.sort_order ?? 0,
        sourceId: null,
        name: null,
        email: null,
        phone: null,
        photoUrl: null,
        specialization: null,
        organization: null,
    };

    if (base.type === 'mentor' && plain.mentor) {
        base.sourceId = plain.mentor.id;
        base.name = plain.mentor.name;
        base.email = plain.mentor.email || null;
        base.photoUrl = plain.mentor.photoUrl || plain.mentor.photo_url || null;
        base.specialization = plain.mentor.specialization || null;
        // Mentor phone lives on user_details.phone_number (field name phoneNumber).
        base.phone =
            plain.mentor.user?.details?.phoneNumber ??
            plain.mentor.user?.details?.phone_number ??
            null;
    } else if (base.type === 'admin' && plain.adminUser) {
        const a = plain.adminUser;
        const d = a.details || {};
        const fullName = [d.firstName, d.lastName].filter(Boolean).join(' ').trim();
        base.sourceId = a.id;
        base.name = fullName || a.email || 'Администратор';
        base.email = a.email || null;
        base.photoUrl = d.imageURL || null;
        base.phone = d.phoneNumber || d.phone_number || null;
    } else if (base.type === 'external' && plain.externalLecturer) {
        const e = plain.externalLecturer;
        base.sourceId = e.id;
        base.name = e.name;
        base.email = e.email || null;
        base.phone = e.phone || null;
        base.photoUrl = e.photoUrl || e.photo_url || null;
        base.organization = e.organization || null;
    }

    return base;
}

/**
 * Normalize an array of seminar_facilitator rows, filter out any empty
 * normalizations, and sort them lead-first then by sortOrder.
 */
function normalizeFacilitators(facilitators) {
    if (!Array.isArray(facilitators)) return [];
    return facilitators
        .map(normalizeFacilitator)
        .filter(Boolean)
        .sort((a, b) => {
            if (a.isLead !== b.isLead) return a.isLead ? -1 : 1;
            return (a.sortOrder || 0) - (b.sortOrder || 0);
        });
}

/**
 * Pick the single lead facilitator from a normalized array, or fall back to
 * the first one. Used for backwards-compat display where only one lecturer
 * fits the UI (old SeminarCatalogCard avatar, legacy `facilitator` field).
 */
function pickLeadFacilitator(normalized) {
    if (!Array.isArray(normalized) || normalized.length === 0) return null;
    return normalized.find((f) => f.isLead) || normalized[0];
}

/**
 * Join normalized facilitator names for CSV / PDF exports.
 *   → "Alice (mentor), Bob (admin), Carol (external)"
 * @param {Array} normalized
 * @param {object} [opts]
 * @param {boolean} [opts.includeType=false] - append "(type)" after each name
 */
function joinFacilitatorNames(normalized, opts = {}) {
    if (!Array.isArray(normalized) || normalized.length === 0) return '';
    return normalized
        .map((f) => (opts.includeType ? `${f.name} (${f.type})` : f.name))
        .filter(Boolean)
        .join(', ');
}

/**
 * Build the Sequelize `include` array needed to resolve every facilitator of
 * a seminar into a normalizeable shape. Call this once and spread it into
 * any seminar.findAll / findOne that needs facilitator data.
 */
function buildFacilitatorsInclude(models) {
    const { seminar_facilitator, mentor, user_account, user_details, external_lecturer } = models;
    return {
        model: seminar_facilitator,
        as: 'facilitators',
        required: false,
        include: [
            {
                model: mentor,
                as: 'mentor',
                required: false,
                attributes: ['id', 'name', 'email', 'photoUrl', 'specialization', 'userId'],
                include: [
                    {
                        model: user_account,
                        as: 'user',
                        required: false,
                        attributes: ['id'],
                        include: [
                            {
                                model: user_details,
                                as: 'details',
                                required: false,
                                attributes: ['phoneNumber'],
                            },
                        ],
                    },
                ],
            },
            {
                model: user_account,
                as: 'adminUser',
                required: false,
                attributes: ['id', 'email', 'role'],
                include: [
                    {
                        model: user_details,
                        as: 'details',
                        required: false,
                        attributes: ['firstName', 'lastName', 'imageURL', 'phoneNumber'],
                    },
                ],
            },
            {
                model: external_lecturer,
                as: 'externalLecturer',
                required: false,
            },
        ],
    };
}

module.exports = {
    normalizeFacilitator,
    normalizeFacilitators,
    pickLeadFacilitator,
    joinFacilitatorNames,
    buildFacilitatorsInclude,
};
