'use strict';

/**
 * Backfill existing seminars into the new seminar_facilitators junction.
 *
 * For every seminar whose legacy `seminars.mentor_id` column is set, insert
 * a single row with facilitator_type='mentor', is_lead=true, role='mentor'.
 * Idempotent — uses ON CONFLICT DO NOTHING equivalent via WHERE NOT EXISTS,
 * so re-running the migration will not duplicate rows.
 *
 * The legacy `seminars.mentor_id` column is NOT dropped — it remains a
 * backwards-compat anchor for old code paths until every consumer is migrated
 * over to reading `facilitators`.
 */
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(`
            INSERT INTO seminar_facilitators
                (seminar_id, facilitator_type, mentor_id, role, is_lead, sort_order, created_at, updated_at)
            SELECT
                s.id,
                'mentor',
                s.mentor_id,
                'mentor',
                true,
                0,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            FROM seminars s
            WHERE s.mentor_id IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1 FROM seminar_facilitators sf
                  WHERE sf.seminar_id = s.id
                    AND sf.mentor_id = s.mentor_id
              )
        `);
    },

    async down(queryInterface) {
        // Roll back only the rows we inserted — any rows created via the new
        // UI after the migration ran must not be deleted.
        await queryInterface.sequelize.query(`
            DELETE FROM seminar_facilitators sf
            USING seminars s
            WHERE sf.seminar_id = s.id
              AND sf.facilitator_type = 'mentor'
              AND sf.is_lead = true
              AND sf.role = 'mentor'
              AND sf.sort_order = 0
              AND sf.mentor_id = s.mentor_id
        `);
    },
};
