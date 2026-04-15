const cron = require('node-cron');
const { Op } = require('sequelize');

const startSeminarReminderCron = () => {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        try {
            const {
                seminar,
                student_seminar,
                student,
                user_account,
                user_details,
                seminar_guest_attendance,
                seminar_facilitator,
                mentor,
                external_lecturer,
            } = require('../sequelize/models/index');
            const { sendSeminarReminder, sendSeminarReminderToFacilitator, getSmsSettings } = require('../utils/smsService');
            const { normalizeFacilitators, buildFacilitatorsInclude } = require('../utils/facilitatorHelpers');

            // Read all SMS settings from DB
            const smsSettings = await getSmsSettings();

            // Global kill switch
            if (smsSettings.sms_enabled === 'false') return;

            const send24h = smsSettings.sms_reminder_24h !== 'false';
            const send1h = smsSettings.sms_reminder_1h !== 'false';

            if (!send24h && !send1h) return; // Both reminders disabled

            const now = new Date();
            const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);
            const in1h = new Date(now.getTime() + 60 * 60 * 1000);
            const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);

            // Build date ranges based on enabled settings
            const dateRanges = [];
            if (send24h) dateRanges.push({ [Op.between]: [in24h, in25h] });
            if (send1h) dateRanges.push({ [Op.between]: [in1h, in2h] });

            // Find seminars starting in ~24h or ~1h. Include the facilitators
            // junction so we can notify mentors/admins/externals too.
            const upcomingSeminars = await seminar.findAll({
                where: {
                    isPublished: true,
                    status: { [Op.in]: ['scheduled', 'live'] },
                    scheduledDate: {
                        [Op.or]: dateRanges,
                    }
                },
                include: [
                    buildFacilitatorsInclude({
                        seminar_facilitator,
                        mentor,
                        user_account,
                        user_details,
                        external_lecturer,
                    }),
                ],
            });

            if (upcomingSeminars.length === 0) return;

            const reminderTemplate = smsSettings.sms_reminder_template;

            for (const sem of upcomingSeminars) {
                const startTime = new Date(sem.scheduledDate);
                const hoursUntil = (startTime - now) / (1000 * 60 * 60);

                // Skip based on individual setting
                if (hoursUntil > 12 && !send24h) continue;
                if (hoursUntil <= 12 && !send1h) continue;

                const timeLabel = hoursUntil > 12 ? 'Утре' : 'След 1 час';

                // Platform users with phone numbers
                const attendees = await student_seminar.findAll({
                    where: { seminarId: sem.id, status: { [Op.in]: ['approved', 'registered'] } },
                    include: [{
                        model: student,
                        as: 'student',
                        include: [{
                            model: user_account,
                            as: 'user',
                            attributes: ['id'],
                            include: [{
                                model: user_details,
                                as: 'details',
                                attributes: ['phoneNumber'],
                            }]
                        }]
                    }]
                });

                for (const att of attendees) {
                    const phone = att.student?.user?.details?.phoneNumber;
                    if (phone && phone.length >= 8) {
                        try {
                            await sendSeminarReminder(phone, sem.title, sem.scheduledDate, sem.location, sem.isOnline, timeLabel, reminderTemplate);
                        } catch (err) {
                            console.error(`SMS reminder to attendee failed (seminar ${sem.id}):`, err?.message || err);
                        }
                    }
                }

                // Guest attendees with phone numbers
                try {
                    const guests = await seminar_guest_attendance.findAll({
                        where: { seminarId: sem.id }
                    });

                    for (const guest of guests) {
                        if (guest.guestPhone && guest.guestPhone.length >= 8) {
                            try {
                                await sendSeminarReminder(guest.guestPhone, sem.title, sem.scheduledDate, sem.location, sem.isOnline, timeLabel, reminderTemplate);
                            } catch (err) {
                                console.error(`SMS reminder to guest failed (seminar ${sem.id}):`, err?.message || err);
                            }
                        }
                    }
                } catch (e) {
                    // seminar_guest_attendance might not exist
                }

                // Facilitators (mentor / admin / external). One SMS each,
                // with a phone guard so missing-phone facilitators are just
                // skipped (logged), never crashing the whole batch.
                try {
                    const normalizedFacs = normalizeFacilitators(sem.facilitators || []);
                    const facilitatorTemplate = smsSettings.sms_reminder_facilitator_template || null;
                    for (const f of normalizedFacs) {
                        if (!f.phone || String(f.phone).trim().length < 8) {
                            console.warn(`[reminder] seminar ${sem.id}: facilitator ${f.type} "${f.name}" has no phone — skipping SMS`);
                            continue;
                        }
                        try {
                            await sendSeminarReminderToFacilitator(
                                f.phone,
                                sem.title,
                                sem.scheduledDate,
                                sem.location,
                                sem.isOnline,
                                timeLabel,
                                facilitatorTemplate
                            );
                        } catch (err) {
                            console.error(`SMS reminder to facilitator failed (seminar ${sem.id}, ${f.type} ${f.name}):`, err?.message || err);
                        }
                    }
                } catch (err) {
                    console.error(`Facilitator reminder loop failed (seminar ${sem.id}):`, err?.message || err);
                }
            }

            if (upcomingSeminars.length > 0) {
                console.log(`📱 Seminar SMS reminders processed for ${upcomingSeminars.length} seminars`);
            }
        } catch (err) {
            console.error('❌ Seminar reminder cron error:', err);
        }
    }, {
        timezone: 'Europe/Sofia',
    });

    console.log('📱 Seminar SMS reminder cron started (hourly)');
};

module.exports = { startSeminarReminderCron };
