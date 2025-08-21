'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('club_locations', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            clubId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                field: 'club_id',
            },
            address: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            city: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            municipality: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            region: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            postalCode: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'postal_code',
            },
            coordinates: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'GPS coordinates: {lat: number, lng: number}',
            },
            venue: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {},
                comment: 'Venue info: {type, size, capacity, facilities, accessibility}',
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'created_at',
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'updated_at',
            },
        });

        await queryInterface.addIndex('club_locations', ['club_id']);
        await queryInterface.addIndex('club_locations', ['city', 'municipality']);
        await queryInterface.addIndex('club_locations', ['region']);
        await queryInterface.addIndex('club_locations', ['postal_code']);

        //TODO - implement endpoint that shows different clubs based on coordinates + extra radius - nearbyClubs
        await queryInterface.addIndex('club_locations', ['coordinates'], {
            using: 'GIST',
            operator: 'jsonb_path_ops',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('club_locations');
    },
};
