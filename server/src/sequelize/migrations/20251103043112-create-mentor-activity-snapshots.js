'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mentor_activity_snapshots', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      mentor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'mentors', 
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      snapshot_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      
      // Stats from Firebase
      firebase_sessions_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      firebase_active_sessions: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      firebase_completed_sessions: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      firebase_online_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      firebase_messages_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      firebase_avg_response_time: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      
      // Stats from PostgreSQL
      postgres_sessions_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      postgres_students_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      postgres_rating: {
        type: Sequelize.DECIMAL(2, 1),
        defaultValue: 0
      },
      
      // Aggregated
      total_sessions: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    // Unique constraint
    await queryInterface.addConstraint('mentor_activity_snapshots', {
      fields: ['mentor_id', 'snapshot_date'],
      type: 'unique',
      name: 'unique_mentor_snapshot_date'
    });

    // Indexes
    await queryInterface.addIndex('mentor_activity_snapshots', ['snapshot_date'], {
      name: 'idx_mentor_activity_snapshots_date'
    });
    
    await queryInterface.addIndex('mentor_activity_snapshots', ['mentor_id'], {
      name: 'idx_mentor_activity_snapshots_mentor'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('mentor_activity_snapshots');
  }
};