'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(`
            CREATE OR REPLACE FUNCTION update_club_member_count()
            RETURNS TRIGGER AS $$
            BEGIN
                IF TG_OP = 'INSERT' THEN
                    UPDATE clubs
                    SET total_members = total_members + 1
                    WHERE id = NEW.club_id;
                    RETURN NEW;

                ELSIF TG_OP = 'DELETE' THEN
                    UPDATE clubs
                    SET total_members = GREATEST(0, total_members - 1)
                    WHERE id = OLD.club_id;
                    RETURN OLD;
                END IF;
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;
        `);

        await queryInterface.sequelize.query(`
            CREATE TRIGGER club_member_count_trigger
            AFTER INSERT OR DELETE ON club_members
            FOR EACH ROW
            EXECUTE FUNCTION update_club_member_count();
        `);

        await queryInterface.sequelize.query(`
            UPDATE clubs
            SET total_members = (
                SELECT COALESCE(COUNT(*), 0)
                FROM club_members
                WHERE club_members.club_id = clubs.id
            );
        `);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(`
            DROP TRIGGER IF EXISTS club_member_count_trigger ON club_members;
        `);

        await queryInterface.sequelize.query(`
            DROP FUNCTION IF EXISTS update_club_member_count();
        `);
    },
};
