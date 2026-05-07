'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('articles', 'status', {
            type: Sequelize.STRING(20),
            allowNull: false,
            defaultValue: 'published',
        });

        await queryInterface.addColumn('articles', 'updatedById', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'user_accounts',
                key: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });

        await queryInterface.addIndex('articles', ['status'], {
            name: 'idx_articles_status',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeIndex('articles', 'idx_articles_status');
        await queryInterface.removeColumn('articles', 'updatedById');
        await queryInterface.removeColumn('articles', 'status');
    },
};
