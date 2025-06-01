'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tables = await queryInterface.showAllTables();
        if (tables.includes('sectionImages')) {
            await queryInterface.renameTable('sectionImages', 'images');
        }

        const updatedTables = await queryInterface.showAllTables();
        if (updatedTables.includes('images')) {
            const tableDesc = await queryInterface.describeTable('images');

            if (!tableDesc.imageable_id) {
                await queryInterface.addColumn('images', 'imageable_id', {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                });
            }
            if (!tableDesc.image_link_connection) {
                await queryInterface.addColumn('images', 'image_link_connection', {
                    type: Sequelize.STRING,
                    allowNull: false,
                });
            }

            if (tableDesc.sectionId) {
                await queryInterface.sequelize.query(`
                    UPDATE images
                    SET imageable_id = "sectionId",
                        image_link_connection = 'section'
                `);

                await queryInterface.removeColumn('images', 'sectionId');
            }
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('images', 'sectionId', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'sections',
                key: 'id',
            },
        });

        await queryInterface.sequelize.query(`
            UPDATE images
            SET "sectionId" = imageable_id
            WHERE image_link_connection = 'section'
        `);

        await queryInterface.removeColumn('images', 'imageable_id');
        await queryInterface.removeColumn('images', 'image_link_connection');

        await queryInterface.renameTable('images', 'sectionImages');
    },
};
