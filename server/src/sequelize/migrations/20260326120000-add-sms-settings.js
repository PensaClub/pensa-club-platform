'use strict';

module.exports = {
    async up(queryInterface) {
        const settings = [
            { key: 'sms_enabled', value: 'true', type: 'boolean', category: 'sms', description: 'Enable/disable SMS notifications' },
            { key: 'sms_reminder_24h', value: 'true', type: 'boolean', category: 'sms', description: 'Send SMS reminder 24h before seminar' },
            { key: 'sms_reminder_1h', value: 'true', type: 'boolean', category: 'sms', description: 'Send SMS reminder 1h before seminar' },
            { key: 'sms_on_registration', value: 'true', type: 'boolean', category: 'sms', description: 'Send SMS when user registers for seminar' },
            { key: 'sms_reminder_template', value: 'Напомняне: {timeLabel} имате семинар "{title}" {location} на {date}. - PensaClub', type: 'string', category: 'sms', description: 'SMS reminder template' },
            { key: 'sms_registration_template', value: 'Записахте се за семинар "{title}" на {date}{location}. Очакваме ви! - PensaClub', type: 'string', category: 'sms', description: 'SMS registration template' },
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
        await queryInterface.bulkDelete('site_settings', {
            key: { [require('sequelize').Op.in]: ['sms_enabled', 'sms_reminder_24h', 'sms_reminder_1h', 'sms_on_registration', 'sms_reminder_template', 'sms_registration_template'] }
        });
    }
};
