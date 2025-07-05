'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // ПРОМЕНИ ТУК !!!
        const demoEmails = ['kolev93@abv.bg', 'atm0sphar3zlalz@gmail.com'];

        const projects = await queryInterface.sequelize.query(`SELECT id FROM projects WHERE slug IN ('pensa-digital-platform', 'senior-art-gallery')`, {
            type: queryInterface.sequelize.QueryTypes.SELECT,
        });

        if (projects.length === 0) {
            console.log('No projects found. Please run the demo-project seeder first.');
            return;
        }

        const users = await queryInterface.sequelize.query(
            `SELECT id FROM user_accounts WHERE email IN ('test@test.com', 'maria@example.com', 'valeri@example.com', 'georgi@example.com', 'elena@example.com', 'ana@example.com')`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (users.length === 0) {
            console.log('No users found. Please run the demo-user seeder first.');
            return;
        }

        const projectIds = projects.map((p) => p.id);
        const userIds = users.map((u) => u.id);

        // List of application data (without emails)
        const applicationsData = [
            {
                project_id: projectIds[0],
                user_id: userIds[0],
                first_name: 'Иван',
                last_name: 'Петров',
                phone: '+359888123456',
                is_anonymous: false,
                status: 'pending',
                applied_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
            {
                project_id: projectIds[0],
                user_id: userIds[1],
                first_name: 'Мария',
                last_name: 'Георгиева',
                phone: '+359888234567',
                is_anonymous: false,
                status: 'approved',
                applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
            {
                project_id: projectIds[0],
                user_id: userIds[2],
                first_name: 'Стефан',
                last_name: 'Димитров',
                phone: '+359888345678',
                is_anonymous: false,
                status: 'pending',
                applied_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
            {
                project_id: projectIds[1],
                user_id: userIds[3],
                first_name: 'Елена',
                last_name: 'Василева',
                phone: '+359888456789',
                is_anonymous: false,
                status: 'approved',
                applied_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            },
            {
                project_id: projectIds[1],
                user_id: userIds[4],
                first_name: 'Николай',
                last_name: 'Тодоров',
                phone: '+359888567890',
                is_anonymous: false,
                status: 'pending',
                applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
            {
                project_id: projectIds[0],
                user_id: userIds[5],
                first_name: 'Anonymous',
                last_name: 'User',
                phone: '+359888999999',
                is_anonymous: true,
                status: 'pending',
                applied_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            },
        ];

        // Add emails dynamically
        const applications = applicationsData.map((app, idx) => ({
            ...app,
            email: demoEmails[idx % demoEmails.length],
            created_at: new Date(),
            updated_at: new Date(),
        }));

        await queryInterface.bulkInsert('project_applications', applications, { returning: true });

        console.log('Demo project applications created successfully!');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('project_applications', {
            email: {
                [Sequelize.Op.in]: demoEmails,
            },
        });
    },
};
