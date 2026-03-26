const twilio = require('twilio');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID || '';

/**
 * Send SMS via Twilio Messaging Service (Alphanumeric Sender)
 */
const sendSMS = async (to, message) => {
    try {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            console.log('⚠️ SMS not configured — skipping');
            return { success: false, reason: 'not_configured' };
        }

        // Ensure phone number has country code
        let phoneNumber = to.replace(/\s/g, '');
        if (phoneNumber.startsWith('0')) {
            phoneNumber = '+359' + phoneNumber.substring(1);
        }
        if (!phoneNumber.startsWith('+')) {
            phoneNumber = '+359' + phoneNumber;
        }

        const msgOptions = {
            body: message,
            to: phoneNumber,
        };

        if (MESSAGING_SERVICE_SID) {
            msgOptions.messagingServiceSid = MESSAGING_SERVICE_SID;
        } else {
            msgOptions.from = process.env.TWILIO_SENDER_NAME || 'PensaClub';
        }

        const result = await client.messages.create(msgOptions);

        console.log(`✅ SMS sent to ${phoneNumber}: ${result.sid}`);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error(`❌ SMS failed to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Read all sms_* settings from site_settings table
 * Returns object: { sms_enabled, sms_reminder_24h, sms_reminder_1h, sms_on_registration, sms_reminder_template, sms_registration_template }
 */
const getSmsSettings = async () => {
    const defaults = {
        sms_enabled: 'true',
        sms_reminder_24h: 'true',
        sms_reminder_1h: 'true',
        sms_on_registration: 'true',
        sms_reminder_template: 'Напомняне: {timeLabel} имате семинар "{title}" {location} на {date}. - PensaClub',
        sms_registration_template: 'Записахте се за семинар "{title}" на {date}{location}. Очакваме ви! - PensaClub',
    };

    try {
        const { site_setting } = require('../sequelize/models/index');
        const { Op } = require('sequelize');
        const rows = await site_setting.findAll({
            where: { key: { [Op.like]: 'sms_%' } },
            attributes: ['key', 'value'],
        });
        for (const row of rows) {
            defaults[row.key] = row.value;
        }
    } catch (e) {
        // table might not exist yet — use defaults
    }

    return defaults;
};

/**
 * Build SMS message from a template string with {placeholders}
 */
const buildMessageFromTemplate = (template, vars) => {
    return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
};

/**
 * Format date for SMS messages
 */
const formatSmsDate = (scheduledDate) => {
    return new Date(scheduledDate).toLocaleString('bg-BG', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

/**
 * Build location text for template interpolation
 */
const buildLocationText = (isOnline, location) => {
    const loc = isOnline ? 'онлайн' : (location || '');
    return loc ? ' в ' + loc : '';
};

/**
 * Send seminar reminder SMS using DB template
 */
const sendSeminarReminder = async (phoneNumber, seminarTitle, scheduledDate, location, isOnline, timeLabel = 'утре', customTemplate = null) => {
    const template = customTemplate || 'Напомняне: {timeLabel} имате семинар "{title}" {location} на {date}. - PensaClub';

    const message = buildMessageFromTemplate(template, {
        timeLabel,
        title: seminarTitle,
        date: formatSmsDate(scheduledDate),
        location: buildLocationText(isOnline, location),
    });

    return sendSMS(phoneNumber, message);
};

/**
 * Send seminar registration SMS using DB template
 */
const sendRegistrationSms = async (phoneNumber, seminarTitle, scheduledDate, location, isOnline, customTemplate = null) => {
    const template = customTemplate || 'Записахте се за семинар "{title}" на {date}{location}. Очакваме ви! - PensaClub';

    const message = buildMessageFromTemplate(template, {
        title: seminarTitle,
        date: formatSmsDate(scheduledDate),
        location: buildLocationText(isOnline, location),
    });

    return sendSMS(phoneNumber, message);
};

module.exports = { sendSMS, sendSeminarReminder, sendRegistrationSms, getSmsSettings };
