'use strict';

// Phase 4 — LLM scoring fields. Per-bot configuration so admins can opt
// individual bots into AI relevance scoring without affecting the rest.
// Defaults are set so an existing bot enabling `useLlm` later just works
// with sensible safety limits.

module.exports = {
    async up(queryInterface, Sequelize) {
        // Model + behaviour
        await queryInterface.addColumn('crawler_bots', 'llmModel', {
            type: Sequelize.STRING(40),
            allowNull: false,
            defaultValue: 'claude-haiku-4-5',
        });
        await queryInterface.addColumn('crawler_bots', 'llmMinScore', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 40,
        });
        await queryInterface.addColumn('crawler_bots', 'llmAutoDismiss', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        });
        await queryInterface.addColumn('crawler_bots', 'llmTemperature', {
            type: Sequelize.DECIMAL(3, 2),
            allowNull: false,
            defaultValue: 0.0,
        });
        await queryInterface.addColumn('crawler_bots', 'llmMaxTokens', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 300,
        });

        // Prompts (null = use built-in defaults at engine level)
        await queryInterface.addColumn('crawler_bots', 'llmSystemPrompt', {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null,
        });
        await queryInterface.addColumn('crawler_bots', 'llmExtraInstructions', {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null,
        });

        // Cost tracking + safety
        await queryInterface.addColumn('crawler_bots', 'llmDailyCostCap', {
            type: Sequelize.DECIMAL(8, 4),
            allowNull: false,
            defaultValue: 1.0,
        });
        await queryInterface.addColumn('crawler_bots', 'llmTokensInToday', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
        await queryInterface.addColumn('crawler_bots', 'llmTokensOutToday', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
        await queryInterface.addColumn('crawler_bots', 'llmCostToday', {
            type: Sequelize.DECIMAL(8, 4),
            allowNull: false,
            defaultValue: 0,
        });
        await queryInterface.addColumn('crawler_bots', 'llmCostResetDate', {
            type: Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: null,
        });
    },

    async down(queryInterface) {
        const cols = [
            'llmCostResetDate', 'llmCostToday', 'llmTokensOutToday', 'llmTokensInToday',
            'llmDailyCostCap', 'llmExtraInstructions', 'llmSystemPrompt',
            'llmMaxTokens', 'llmTemperature', 'llmAutoDismiss', 'llmMinScore', 'llmModel',
        ];
        for (const c of cols) {
            await queryInterface.removeColumn('crawler_bots', c);
        }
    },
};
