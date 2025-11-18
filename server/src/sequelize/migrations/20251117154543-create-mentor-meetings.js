'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('mentor_meetings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      mentor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'mentors',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user_accounts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      meeting_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      meeting_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60,
        comment: 'Duration in minutes'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'scheduled',
        comment: 'scheduled, completed, cancelled'
      },
      meeting_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'online',
        comment: 'online, phone, in_person'
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });

    // Indexes за по-бързи queries
    await queryInterface.addIndex('mentor_meetings', ['mentor_id'], {
      name: 'idx_mentor_meetings_mentor'
    });

    await queryInterface.addIndex('mentor_meetings', ['student_id'], {
      name: 'idx_mentor_meetings_student'
    });

    await queryInterface.addIndex('mentor_meetings', ['status'], {
      name: 'idx_mentor_meetings_status'
    });

    await queryInterface.addIndex('mentor_meetings', ['meeting_date'], {
      name: 'idx_mentor_meetings_date'
    });
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('mentor_meetings');
  },
};