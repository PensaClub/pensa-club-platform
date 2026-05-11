'use strict';

// Phase 4: AI-generated reasoning blurb stored alongside relevance score.
// Used by the FindingsList card hover-tooltip and the email report.

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('crawler_findings', 'llmReasoning', {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('crawler_findings', 'llmReasoning');
    },
};
