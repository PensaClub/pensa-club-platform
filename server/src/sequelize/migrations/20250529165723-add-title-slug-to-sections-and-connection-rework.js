'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableDesc = await queryInterface.describeTable('sections');

        if (!tableDesc.title_slug) {
            await queryInterface.addColumn('sections', 'title_slug', {
                type: Sequelize.STRING,
                allowNull: true,
            });
        }
        if (!tableDesc.sectionable_id) {
            await queryInterface.addColumn('sections', 'sectionable_id', {
                type: Sequelize.INTEGER,
                allowNull: false,
            });
        }
        if (!tableDesc.section_link_connection) {
            await queryInterface.addColumn('sections', 'section_link_connection', {
                type: Sequelize.STRING,
                allowNull: false,
            });
        }

        if (tableDesc.articleId) {
            await queryInterface.sequelize.query(`
                UPDATE sections
                SET sectionable_id = "articleId",
                    section_link_connection = 'article'
            `);

            await queryInterface.removeColumn('sections', 'articleId');
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('sections', 'articleId', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'articles',
                key: 'id',
            },
        });

        await queryInterface.sequelize.query(`
            UPDATE sections
            SET "articleId" = sectionable_id
            WHERE section_link_connection = 'article'
        `);

        await queryInterface.removeColumn('sections', 'sectionable_id');
        await queryInterface.removeColumn('sections', 'section_link_connection');
        await queryInterface.removeColumn('sections', 'title_slug');
    },
};
