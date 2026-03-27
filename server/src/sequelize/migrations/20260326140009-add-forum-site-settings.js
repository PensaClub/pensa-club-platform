'use strict';

const defaultRulesBg = `<h3>Правила на Общността</h3>
<ol>
<li>Уважавайте другите участници — без обиди, дискриминация, тормоз</li>
<li>Без нецензурен език и вулгарно съдържание</li>
<li>Без спам, реклами и нежелана промоция</li>
<li>Без фалшива информация и дезинформация</li>
<li>Споделяйте само собствено съдържание или цитирайте източника</li>
<li>Без лични данни на трети лица (телефони, адреси, снимки без съгласие)</li>
<li>Публикувайте в подходящото пространство</li>
<li>Без дублиращи се постове</li>
<li>Следвайте указанията на модераторите</li>
</ol>`;

const defaultRulesEn = `<h3>Community Rules</h3>
<ol>
<li>Respect other members — no insults, discrimination, or harassment</li>
<li>No profanity or vulgar content</li>
<li>No spam, advertisements, or unsolicited promotion</li>
<li>No false information or misinformation</li>
<li>Share only your own content or cite the source</li>
<li>No personal data of third parties (phone numbers, addresses, photos without consent)</li>
<li>Post in the appropriate space</li>
<li>No duplicate posts</li>
<li>Follow moderator instructions</li>
</ol>`;

const defaultRulesDe = `<h3>Gemeinschaftsregeln</h3>
<ol>
<li>Respektieren Sie andere Mitglieder — keine Beleidigungen, Diskriminierung oder Belästigung</li>
<li>Keine Schimpfwörter oder vulgäre Inhalte</li>
<li>Kein Spam, keine Werbung oder unerwünschte Promotion</li>
<li>Keine Falschinformationen oder Desinformation</li>
<li>Teilen Sie nur eigene Inhalte oder zitieren Sie die Quelle</li>
<li>Keine persönlichen Daten Dritter (Telefonnummern, Adressen, Fotos ohne Zustimmung)</li>
<li>Veröffentlichen Sie im passenden Bereich</li>
<li>Keine doppelten Beiträge</li>
<li>Befolgen Sie die Anweisungen der Moderatoren</li>
</ol>`;

module.exports = {
  async up(queryInterface, Sequelize) {
    // Extend value column to TEXT to support long content (forum rules HTML)
    await queryInterface.changeColumn('site_settings', 'value', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    const settings = [
      { key: 'forum_enabled', value: 'true', type: 'boolean', category: 'forum', description: 'Enable/disable forum' },
      { key: 'forum_posts_require_approval', value: 'true', type: 'boolean', category: 'forum', description: 'All posts require approval (overrides VIP)' },
      { key: 'forum_comments_require_approval', value: 'false', type: 'boolean', category: 'forum', description: 'Comments require approval' },
      { key: 'forum_vip_auto_promote', value: 'true', type: 'boolean', category: 'forum', description: 'Auto-promote users to VIP' },
      { key: 'forum_vip_min_posts', value: '3', type: 'number', category: 'forum', description: 'Min approved posts for VIP' },
      { key: 'forum_vip_min_comments', value: '10', type: 'number', category: 'forum', description: 'Min comments for VIP' },
      { key: 'forum_vip_min_days', value: '30', type: 'number', category: 'forum', description: 'Min days since registration for VIP' },
      { key: 'forum_max_images_per_post', value: '10', type: 'number', category: 'forum', description: 'Max images per post' },
      { key: 'forum_reports_to_auto_hide', value: '3', type: 'number', category: 'forum', description: 'Reports needed to auto-hide content' },
      { key: 'forum_allow_guest_read', value: 'true', type: 'boolean', category: 'forum', description: 'Guests can read forum (SEO)' },
      { key: 'forum_poll_enabled', value: 'true', type: 'boolean', category: 'forum', description: 'Polls enabled' },
      { key: 'forum_post_of_week_enabled', value: 'true', type: 'boolean', category: 'forum', description: 'Post of the week feature' },
      { key: 'forum_rules_bg', value: defaultRulesBg, type: 'string', category: 'forum', description: 'Forum rules (Bulgarian)' },
      { key: 'forum_rules_en', value: defaultRulesEn, type: 'string', category: 'forum', description: 'Forum rules (English)' },
      { key: 'forum_rules_de', value: defaultRulesDe, type: 'string', category: 'forum', description: 'Forum rules (German)' },
      { key: 'forum_rules_version', value: '1', type: 'number', category: 'forum', description: 'Forum rules version (increment to require re-acceptance)' },
    ];

    for (const s of settings) {
      const existing = await queryInterface.rawSelect('site_settings', { where: { key: s.key } }, ['id']);
      if (!existing) {
        await queryInterface.bulkInsert('site_settings', [{
          ...s,
          created_at: new Date(),
          updated_at: new Date(),
        }]);
      }
    }
  },

  async down(queryInterface) {
    const { Op } = require('sequelize');
    await queryInterface.bulkDelete('site_settings', {
      key: { [Op.like]: 'forum_%' },
    });
  },
};
