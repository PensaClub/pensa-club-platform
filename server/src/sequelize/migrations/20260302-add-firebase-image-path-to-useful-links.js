'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('useful_links', 'firebaseImagePath', {
            type: Sequelize.STRING(2048),
            allowNull: true,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('useful_links', 'firebaseImagePath');
    },
};
