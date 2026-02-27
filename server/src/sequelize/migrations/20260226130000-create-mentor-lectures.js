'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // НОВО — създаване на mentor_lectures junction таблица
    await queryInterface.createTable('mentor_lectures', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      mentor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'mentors',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      lecture_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'lectures',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'lecturer',
      },
      is_lead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // НОВО — уникален индекс за да няма дублирани ментори в една лекция
    await queryInterface.addIndex('mentor_lectures', ['mentor_id', 'lecture_id'], {
      unique: true,
      name: 'idx_mentor_lectures_unique',
    });

    await queryInterface.addIndex('mentor_lectures', ['lecture_id'], {
      name: 'idx_mentor_lectures_lecture_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mentor_lectures');
  },
};