'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const adminPassword = process.env.admin_password;
    const adminEmail = process.env.admin_email;

    if (!adminPassword || !adminEmail) throw new Error('Environment variables admin_password and admin_email must be set');

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const userAccount = await queryInterface.bulkInsert(
      'user_accounts',
      [
        {
          email: adminEmail,
          password: hashedPassword,
          finished: true,
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: true }
    );

    await queryInterface.bulkInsert(
      'user_details',
      [
        {
          phone_number: '0888888888',
          username: 'Admin',
          first_name: 'Admin',
          last_name: 'Admin',
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
          user_accounts_id: userAccount[0].id,
          createdAt: new Date(),
          updatedAt: new Date(),
          imageURL:
            'https://firebasestorage.googleapis.com/v0/b/pensaclub-909e0.appspot.com/o/profile-image%2F680555ff-22d4-4fad-8cc7-2b51dfb545de?alt=media&token=ab616f26-8eda-49e5-b1c9-2694540ec972',
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_accounts', null, {});
    await queryInterface.bulkDelete('user_details', null, {});
  },
};
