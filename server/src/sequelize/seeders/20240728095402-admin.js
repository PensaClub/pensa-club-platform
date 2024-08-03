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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { returning: true }
    );

    const data = {
      phone_number: '0888888888',
      username: 'AdminPensa',
      first_name: 'AdminPensa',
      last_name: 'AdminPensa',
      region: 'Търговище',
      municipality: 'Попово',
      settlement: 'Попово',
      street: 'Мара Тасева',
      work_options: ['architecture_construction', 'medicine_healthcare'],
      skills: ['communication_skills'],
      interest_options: ['volunteering', 'spiritual_practices'],
      district: '',
      block: null,
      street_number: '7',
      location: JSON.stringify({ lat: 43.34658, lon: 26.23078 }),
      gender: 'male',
      birth_date: '1990-01-01',
      user_accounts_id: userAccount.id,
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
