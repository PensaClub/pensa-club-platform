'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Connect stories (IDs 1 and 2) to initiative (ID 1)
        await queryInterface.bulkInsert(
            'initiative_stories',
            [1, 2].map((storyId) => ({
                initiative_id: 1,
                story_id: storyId,
                created_at: new Date(),
                updated_at: new Date(),
            }))
        );

        // Connect publications (IDs 2 and 3) to initiative (ID 1)
        await queryInterface.bulkInsert(
            'initiative_publications',
            [2, 3].map((publicationId) => ({
                initiative_id: 1,
                publication_id: publicationId,
                created_at: new Date(),
                updated_at: new Date(),
            }))
        );

        // Connect project (ID 1) to initiative (ID 1)
        await queryInterface.bulkInsert('initiative_projects', [
            {
                initiative_id: 1,
                project_id: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Connect stories to projects
        // Project 1 gets stories 1 and 2
        // Project 2 gets story 3
        await queryInterface.bulkInsert('project_stories', [
            {
                project_id: 1,
                story_id: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                project_id: 1,
                story_id: 2,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                project_id: 2,
                story_id: 3,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Connect publications to projects
        // Project 1 gets publications 1 and 2
        // Project 2 gets publication 3
        await queryInterface.bulkInsert('project_publications', [
            {
                project_id: 1,
                publication_id: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                project_id: 1,
                publication_id: 2,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                project_id: 2,
                publication_id: 3,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        // Remove all connections
        await queryInterface.bulkDelete('initiative_stories', null, {});
        await queryInterface.bulkDelete('initiative_publications', null, {});
        await queryInterface.bulkDelete('initiative_projects', null, {});
        await queryInterface.bulkDelete('project_stories', null, {});
        await queryInterface.bulkDelete('project_publications', null, {});
    },
};
