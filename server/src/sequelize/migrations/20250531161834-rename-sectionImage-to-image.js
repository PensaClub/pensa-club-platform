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
                    allowNull: true,
                });
            }
            if (!tableDesc.image_link_connection) {
                await queryInterface.addColumn('images', 'image_link_connection', {
                    type: Sequelize.STRING,
                    allowNull: true,
                });
            }
            if (!tableDesc.is_uploading) {
                await queryInterface.addColumn('images', 'is_uploading', {
                    type: Sequelize.BOOLEAN,
                    allowNull: true,
                    defaultValue: false,
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

            if (tableDesc.createdAt) {
                await queryInterface.renameColumn('images', 'createdAt', 'created_at');
            }
            if (tableDesc.updatedAt) {
                await queryInterface.renameColumn('images', 'updatedAt', 'updated_at');
            }

            await queryInterface.changeColumn('images', 'imageable_id', {
                type: Sequelize.INTEGER,
                allowNull: false,
            });
            await queryInterface.changeColumn('images', 'image_link_connection', {
                type: Sequelize.STRING,
                allowNull: false,
            });
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('images', 'imageable_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
        await queryInterface.changeColumn('images', 'image_link_connection', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.renameColumn('images', 'created_at', 'createdAt');
        await queryInterface.renameColumn('images', 'updated_at', 'updatedAt');

        await queryInterface.addColumn('images', 'sectionId', {
            type: Sequelize.INTEGER,
            allowNull: true,
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

        await queryInterface.changeColumn('images', 'sectionId', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'sections',
                key: 'id',
            },
        });

        await queryInterface.removeColumn('images', 'imageable_id');
        await queryInterface.removeColumn('images', 'image_link_connection');
        await queryInterface.removeColumn('images', 'is_uploading');

        await queryInterface.renameTable('images', 'sectionImages');
    },
};
