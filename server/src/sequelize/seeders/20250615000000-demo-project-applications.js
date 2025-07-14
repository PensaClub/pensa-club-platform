'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        //ПРОМЕНИ ИМЕЙЛИТЕ ЗА ТЕСТВАНЕ - МАКСИМУМ 2 ИМЕЙЛА !!
        const demoEmails = ['lenadoncheva1958@gmail.com', 'kirova.elina@gmail.com', 'lmilkoeva@abv.bg'];

        const projects = await queryInterface.sequelize.query(`SELECT id FROM projects WHERE slug IN ('pensa-digital-platform', 'senior-art-gallery')`, {
            type: queryInterface.sequelize.QueryTypes.SELECT,
        });

        if (projects.length === 0) {
            console.log('No projects found. Please run the demo-project seeder first.');
            return;
        }

        const users = await queryInterface.sequelize.query(
            `SELECT id FROM user_accounts WHERE email IN ('test@test.com', 'maria@example.com', 'valeri@example.com')`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (users.length < 3) {
            console.log('Not enough users found. Please run the demo-user seeder first.');
            return;
        }

        const projectIds = projects.map((p) => p.id);
        const userIds = users.map((u) => u.id);

        // 3 demo applications
        const applicationsData = [
            {
                project_id: projectIds[0],
                user_id: userIds[0],
                first_name: 'Иван',
                last_name: 'Петров',
                email: demoEmails[0],
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
                email: demoEmails[1],
                phone: '+359888234567',
                is_anonymous: false,
                status: 'approved',
                applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
            {
                project_id: projectIds[1],
                user_id: userIds[2],
                first_name: 'Стефан',
                last_name: 'Димитров',
                email: demoEmails[2],
                phone: '+359888345678',
                is_anonymous: false,
                status: 'pending',
                applied_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
        ];

        const applications = applicationsData.map((app) => ({
            ...app,
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
