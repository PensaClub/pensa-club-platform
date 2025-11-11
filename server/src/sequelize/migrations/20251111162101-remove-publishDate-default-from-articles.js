'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
       
        await queryInterface.changeColumn('articles', 'publishDate', {
            type: Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: null,
        });
    },

    async down(queryInterface, Sequelize) {
      
        await queryInterface.changeColumn('articles', 'publishDate', {
            type: Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: Sequelize.NOW,
        });
    },
};