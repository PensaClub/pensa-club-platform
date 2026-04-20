'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('subscribers');

    if (!tableDesc.status) {
      await queryInterface.addColumn('subscribers', 'status', {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'active',
      });
    }

    if (!tableDesc.unsubscribe_token) {
      await queryInterface.addColumn('subscribers', 'unsubscribe_token', {
        type: Sequelize.UUID,
        allowNull: true,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
      });
    }

    if (!tableDesc.unsubscribed_at) {
      await queryInterface.addColumn('subscribers', 'unsubscribed_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    if (!tableDesc.source) {
      await queryInterface.addColumn('subscribers', 'source', {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'website',
      });
    }

    if (!tableDesc.phone) {
      await queryInterface.addColumn('subscribers', 'phone', {
        type: Sequelize.STRING(20),
        allowNull: true,
      });
    }

    // Backfill unsubscribe_token for existing subscribers
    const { QueryTypes } = Sequelize;
    const existing = await queryInterface.sequelize.query(
      'SELECT id FROM subscribers WHERE unsubscribe_token IS NULL',
      { type: QueryTypes.SELECT }
    );
    for (const row of existing) {
      await queryInterface.sequelize.query(
        'UPDATE subscribers SET unsubscribe_token = gen_random_uuid() WHERE id = :id',
        { replacements: { id: row.id } }
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('subscribers', 'phone');
    await queryInterface.removeColumn('subscribers', 'source');
    await queryInterface.removeColumn('subscribers', 'unsubscribed_at');
    await queryInterface.removeColumn('subscribers', 'unsubscribe_token');
    await queryInterface.removeColumn('subscribers', 'status');
  },
};
