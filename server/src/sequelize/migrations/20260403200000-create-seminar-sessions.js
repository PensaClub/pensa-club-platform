'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Seminar sessions table
    await queryInterface.createTable('seminar_sessions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      seminar_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'seminars', key: 'id' },
        onDelete: 'CASCADE',
      },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      start_time: { type: Sequelize.TIME, allowNull: false },
      end_time: { type: Sequelize.TIME, allowNull: true },
      location: { type: Sequelize.STRING(500), allowNull: true },
      max_participants: { type: Sequelize.INTEGER, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.addIndex('seminar_sessions', ['seminar_id']);
    await queryInterface.addIndex('seminar_sessions', ['date']);

    // Session attendance table
    await queryInterface.createTable('session_attendances', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'seminar_sessions', key: 'id' },
        onDelete: 'CASCADE',
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'students', key: 'id' },
        onDelete: 'CASCADE',
      },
      guest_attendance_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'seminar_guest_attendances', key: 'id' },
        onDelete: 'CASCADE',
      },
      registered: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      attended: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      attended_at: { type: Sequelize.DATE, allowNull: true },
      participation_level: { type: Sequelize.STRING(20), allowNull: true, defaultValue: 'passive' },
      earned_credits: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      marked_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.addIndex('session_attendances', ['session_id']);
    await queryInterface.addIndex('session_attendances', ['student_id']);
    await queryInterface.addIndex('session_attendances', ['guest_attendance_id']);
    await queryInterface.addConstraint('session_attendances', {
      fields: ['session_id', 'student_id'],
      type: 'unique',
      name: 'session_attendance_student_unique',
      where: { student_id: { [Sequelize.Op.ne]: null } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('session_attendances');
    await queryInterface.dropTable('seminar_sessions');
  },
};
