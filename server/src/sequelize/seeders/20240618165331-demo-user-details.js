'use strict';
const { QueryTypes } = require('sequelize');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(`SELECT id FROM "user_accounts" WHERE email = 'test@test.com' LIMIT 1;`, { type: QueryTypes.SELECT });

    const userId = users[0].id;

    await queryInterface.bulkInsert(
      'user_details',
      [
        {
          phone_number: '0888246700',
          username: 'TestUser',
          first_name: 'TestName',
          last_name: 'TestSurname',
          region: 'Търговище',
          municipality: 'Попово',
          settlement: 'Попово',
          street: 'Маджаров',
          work_options: ['TestWork', 'TestWork2'],
          skills: ['TestSkill'],
          interest_options: ['TestOption', 'TestOption2'],
          district: '',
          block: null,
          street_number: '5',
          location: JSON.stringify({ lat: 43.34342, lon: 26.22919 }),
          gender: 'male',
          birth_date: '1993-04-09',
          user_accounts_id: userId,
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
    await queryInterface.bulkDelete('user_details', null, {});
  },
};
