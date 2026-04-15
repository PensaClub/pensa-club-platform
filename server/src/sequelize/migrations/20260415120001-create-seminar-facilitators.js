'use strict';

/**
 * Create seminar_facilitators junction table.
 *
 * This replaces the old single-mentor model. A seminar can now have multiple
 * facilitators of 3 different kinds:
 *   - mentor    → FK mentor_id
 *   - admin     → FK admin_user_id (admin or moderator user_account)
 *   - external  → FK external_lecturer_id
 *
 * Exactly ONE of the three FK columns is populated per row, enforced by
 * a CHECK constraint. Each row has a role (lecturer/mentor/assistant/guest)
 * and an is_lead flag — exactly one row per seminar should be the lead
 * (enforcement is done application-side, not in DB).
 *
 * The legacy `seminars.mentor_id` column is left intact for backwards
 * compatibility and will be backfilled into this table in the next migration.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('seminar_facilitators', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            seminar_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'seminars', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            facilitator_type: {
                type: Sequelize.STRING(20),
                allowNull: false,
                // 'mentor' | 'admin' | 'external'
            },
            mentor_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'mentors', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            admin_user_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'user_accounts', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            external_lecturer_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'external_lecturers', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            role: {
                type: Sequelize.STRING(30),
                allowNull: false,
                defaultValue: 'mentor',
                // 'lecturer' | 'mentor' | 'assistant' | 'guest'
            },
            is_lead: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            sort_order: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        // CHECK constraint: exactly one of the three FK columns must be non-null,
        // matching the declared facilitator_type.
        await queryInterface.sequelize.query(`
            ALTER TABLE seminar_facilitators
            ADD CONSTRAINT seminar_facilitators_type_fk_check
            CHECK (
                (facilitator_type = 'mentor'   AND mentor_id IS NOT NULL AND admin_user_id IS NULL AND external_lecturer_id IS NULL) OR
                (facilitator_type = 'admin'    AND admin_user_id IS NOT NULL AND mentor_id IS NULL AND external_lecturer_id IS NULL) OR
                (facilitator_type = 'external' AND external_lecturer_id IS NOT NULL AND mentor_id IS NULL AND admin_user_id IS NULL)
            )
        `);

        await queryInterface.addIndex('seminar_facilitators', ['seminar_id'], {
            name: 'idx_seminar_facilitators_seminar',
        });
        await queryInterface.addIndex('seminar_facilitators', ['mentor_id'], {
            name: 'idx_seminar_facilitators_mentor',
        });
        await queryInterface.addIndex('seminar_facilitators', ['admin_user_id'], {
            name: 'idx_seminar_facilitators_admin',
        });
        await queryInterface.addIndex('seminar_facilitators', ['external_lecturer_id'], {
            name: 'idx_seminar_facilitators_external',
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('seminar_facilitators');
    },
};
