/**
 * Helper for enqueueing reactive publish events — used by seminar/article/course
 * etc. publish controllers. Safe to call: swallows errors so a failed enqueue
 * never blocks the primary publish transaction.
 *
 * Allowed types (mapped 1:1 to subscriber_preference categories where possible):
 *   seminar      → seminars
 *   article      → articles
 *   course       → courses
 *   initiative   → initiatives
 *   project      → initiatives (same category, shared preference)
 *   publication  → initiatives (same category)
 *   club         → clubs
 */

const TYPE_TO_CATEGORY = {
    seminar: 'seminars',
    article: 'articles',
    course: 'courses',
    initiative: 'initiatives',
    project: 'initiatives',
    publication: 'initiatives',
    club: 'clubs',
};

async function enqueuePublishEvent({ type, referenceId, referenceTitle, referenceSlug, thumbnail }) {
    try {
        const category = TYPE_TO_CATEGORY[type];
        if (!category) return;

        const { notification_queue } = require('../sequelize/models/index');

        // Dedupe — if an identical pending record exists for the same object,
        // don't queue again (e.g. admin toggles publish off/on).
        const existing = await notification_queue.findOne({
            where: { type, referenceId, status: 'pending' },
        });
        if (existing) return;

        await notification_queue.create({
            type,
            referenceId: referenceId || null,
            referenceTitle: (referenceTitle || '').slice(0, 500),
            referenceSlug: (referenceSlug || '').slice(0, 500),
            category,
            thumbnail: thumbnail || null,
            status: 'pending',
        });
    } catch (err) {
        console.error('[notificationQueue] enqueue failed:', err?.message || err);
        // Swallow — publish should never fail because of a notification queue error.
    }
}

module.exports = { enqueuePublishEvent, TYPE_TO_CATEGORY };
