'use strict';
const bcrypt = require('bcrypt');
const { user_account, user_details } = require('../models/index');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const adminPassword = process.env.admin_password;
        const adminEmail = process.env.admin_email;

        if (!adminPassword || !adminEmail) throw new Error('Environment variables admin_password and admin_email must be set');

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const userAccount = await user_account.create(
            {
                email: adminEmail,
                password: hashedPassword,
                finished: true,
                role: 'admin',
                isGoogleUser: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            { returning: true }
        );

        const data = {
            phoneNumber: '0888888888',
            username: 'AdminPensa',
            firstName: 'AdminPensa',
            lastName: 'AdminPensa',
            region: 'Търговище',
            workOptions: ['architecture_construction', 'medicine_healthcare'],
            skills: ['communication_skills'],
            interestOptions: ['volunteering', 'spiritual_practices'],
            location: { lat: 43.34658, lon: 26.23078 },
            gender: 'male',
            birthDate: '1990-01-01',
            userAccountsId: userAccount.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            imageURL:
                'https://firebasestorage.googleapis.com/v0/b/pensaclub-909e0.appspot.com/o/profile-image%2F680555ff-22d4-4fad-8cc7-2b51dfb545de?alt=media&token=ab616f26-8eda-49e5-b1c9-2694540ec972',
        };

        await user_details.create(data, { where: { id: userAccount.id } });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('user_accounts', null, {});
        await queryInterface.bulkDelete('user_details', null, {});
    },
};
