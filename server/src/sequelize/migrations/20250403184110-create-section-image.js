'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
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
                unique: true,
            },
            src: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            alt: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            caption: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('sectionImages');
    },
};
