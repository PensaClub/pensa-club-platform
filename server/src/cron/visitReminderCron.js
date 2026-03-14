const cron = require('node-cron');
const { Op } = require('sequelize');
const { club_visit_request, mentor, user_notification } = require('../sequelize/models/index');
const { handlePersonalEmail } = require('../utils/clubUtils');

const topicLabels = {
  fake_news: 'Фалшиви новини',
  voter_rights: 'Права на избирателите',
  election_process: 'Изборен процес',
  other: 'Друго',
};

/**
 * Cron job за напомняне за предстоящи посещения
 * Изпълнява се всеки ден в 09:00 (София)
 * Изпраща напомняне 2 дни преди посещението
 */
const startVisitReminderCron = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running visit reminder cron...');

    try {
      // Calculate date 2 days from now
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 2);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // Find requests needing reminders
      const requests = await club_visit_request.findAll({
        where: {
          preferredDate: targetDateStr,
          status: { [Op.in]: ['confirmed', 'mentor_assigned'] },
          reminderSent: false,
        },
        include: [{
          model: mentor,
          as: 'assignedMentor',
          attributes: ['id', 'name', 'email'],
          required: false,
        }],
      });

      for (const request of requests) {
        // Send reminder to club contact
        try {
          await handlePersonalEmail({
            from: 'noreply@pensa.club',
            to: request.contactEmail,
            subject: 'Напомняне: предстоящо посещение — Програма ReАкция',
            message: `Здравейте, ${request.contactName},\n\nНапомняме Ви, че след 2 дни (${request.preferredDate}) е насрочено посещение на ментор от Програма ReАкция.\n\nКлуб: ${request.clubName}\nТема: ${topicLabels[request.topic] || request.topic}\n\nАко имате въпроси, моля свържете се с нас на pensa.club@gmail.com.\n\nС уважение,\nЕкипът на ПЕНСА`,
          });
        } catch (emailError) {
          console.error(`Failed to send reminder to club ${request.clubName}:`, emailError);
        }

        // Send reminder to assigned mentor
        if (request.assignedMentor) {
          try {
            await handlePersonalEmail({
              from: 'noreply@pensa.club',
              to: request.assignedMentor.email,
              subject: 'Напомняне: предстоящо посещение — Програма ReАкция',
              message: `Здравейте, ${request.assignedMentor.name},\n\nНапомняме Ви, че след 2 дни (${request.preferredDate}) имате насрочено посещение.\n\nКлуб: ${request.clubName}\nГрад: ${request.city}\nТема: ${topicLabels[request.topic] || request.topic}\nБрой участници: ${request.participantsCount}\nКонтакт: ${request.contactName}, ${request.contactPhone}\n\nС уважение,\nЕкипът на ПЕНСА`,
            });
          } catch (emailError) {
            console.error(`Failed to send reminder to mentor ${request.assignedMentor.name}:`, emailError);
          }
        }

        // User notification (if request has userId)
        if (request.userId) {
          try {
            await user_notification.create({
              userId: request.userId,
              type: 'reaction_visit_reminder',
              title: 'Напомняне за предстоящо посещение',
              message: `След 2 дни (${request.preferredDate}) е насрочено посещение в клуб "${request.clubName}".`,
              data: {
                requestId: request.id,
                trackingCode: request.trackingCode,
              },
            });
          } catch (notifError) {
            console.error(`Failed to create user notification for request ${request.id}:`, notifError);
          }
        }

        // Mark reminder as sent
        try {
          await request.update({ reminderSent: true });
        } catch (updateError) {
          console.error(`Failed to update reminder_sent for request ${request.id}:`, updateError);
        }
      }

      if (requests.length > 0) {
        console.log(`Visit reminder cron: sent ${requests.length} reminder(s).`);
      }
    } catch (error) {
      console.error('Visit reminder cron failed:', error);
    }
  }, {
    timezone: 'Europe/Sofia',
  });

  console.log('Visit reminder cron job started (runs daily at 09:00 Sofia time)');
};

module.exports = { startVisitReminderCron };
