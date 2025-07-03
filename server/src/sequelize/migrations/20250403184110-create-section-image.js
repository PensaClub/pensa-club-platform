'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if the table already exists (it will in dev after rename)
        const tableExists = await queryInterface.showAllTables().then((tables) => tables.includes('sectionImages'));

        if (!tableExists) {
            await queryInterface.createTable('sectionImages', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                sectionId: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'sections',
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
                    allowNull: false,
                },
                src: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                alt: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                caption: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATEONLY,
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATEONLY,
                },
            });
        }
    },
    async down(queryInterface, Sequelize) {
        const tableExists = await queryInterface.showAllTables().then((tables) => tables.includes('sectionImages'));

        if (tableExists) {
            await queryInterface.dropTable('sectionImages');
        }
    },
};
