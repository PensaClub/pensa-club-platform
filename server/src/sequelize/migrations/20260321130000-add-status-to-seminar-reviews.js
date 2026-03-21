'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('seminar_reviews', 'status', {
            type: Sequelize.STRING(20),
            allowNull: false,
            defaultValue: 'pending'
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('seminar_reviews', 'status');
    }
};
