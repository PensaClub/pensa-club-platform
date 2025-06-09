'use strict';
const bcrypt = require('bcrypt');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const hashedPassword = await bcrypt.hash('Test1234', 10);

        await queryInterface.bulkInsert(
            'user_accounts',
            [
                {
                    email: 'test@test.com',
                    password: hashedPassword,
                    finished: true,
                    is_google_user: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Adding all unique users from comments
                {
                    email: 'maria@example.com',
                    password: hashedPassword,
                    finished: true,
                    is_google_user: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: 'valeri@example.com',
                    password: hashedPassword,
                    finished: true,
                    is_google_user: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: 'georgi@example.com',
                    password: hashedPassword,
                    finished: true,
                    is_google_user: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: 'elena@example.com',
                    password: hashedPassword,
                    finished: true,
                    is_google_user: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: 'ana@example.com',
                    password: hashedPassword,
                    finished: true,
                    is_google_user: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: 'ivan@example.com',
                    password: hashedPassword,
                    finished: true,
                    is_google_user: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: 'stoyan@example.com',
                    password: hashedPassword,
                    finished: true,
                    is_google_user: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: 'milka@example.com',
                    password: hashedPassword,
                    finished: true,
                    is_google_user: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: 'rosen@example.com',
                    password: hashedPassword,
                    finished: true,
                    is_google_user: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: 'petya@example.com',
                    password: hashedPassword,
                    finished: true,
                    is_google_user: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: 'stefan@example.com',
                    password: hashedPassword,
                    finished: true,
                    is_google_user: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: 'anna@example.com',
                    password: hashedPassword,
                    finished: true,
                    is_google_user: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: 'vasil@example.com',
                    password: hashedPassword,
                    finished: true,
                    is_google_user: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('user_accounts', null, {});
    },
};
