'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('articles', 'usefulLinks', {
            type: Sequelize.JSONB,
            allowNull: true,
            defaultValue: [],
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('articles', 'usefulLinks');
    },
};
