'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('seminar_reviews', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            seminar_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'seminars', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            student_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'students', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            rating: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: { min: 1, max: 5 }
            },
            comment: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('NOW()')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('NOW()')
            }
        });

        await queryInterface.addIndex('seminar_reviews', ['seminar_id']);
        await queryInterface.addIndex('seminar_reviews', ['student_id']);
        await queryInterface.addConstraint('seminar_reviews', {
            fields: ['seminar_id', 'student_id'],
            type: 'unique',
            name: 'unique_seminar_student_review'
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('seminar_reviews');
    }
};
