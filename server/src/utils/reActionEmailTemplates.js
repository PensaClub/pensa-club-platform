/**
 * ReAction Program — branded email templates
 * All emails include both logos: БФЖ + Фондация ПЕНСА
 */

const BFW_LOGO = 'https://pensa.club/images/partners/BFFW-20Logo-Prink2.svg';
const PENSA_LOGO = 'https://pensa.club/images/homePage/logo.png';

// ─── Base wrapper ───────────────────────────────────────────────────────
const wrapTemplate = (title, bodyHtml, footerNote = '') => `
<!DOCTYPE html>
<html lang="bg">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f0ec;font-family:'Segoe UI',Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0ec;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

        <!-- Header with gradient -->
        <tr>
          <td style="background:linear-gradient(135deg,#1f2937 0%,#2d3a4a 50%,#374151 100%);padding:28px 32px 20px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:16px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-right:20px;">
                        <img src="${BFW_LOGO}" alt="БФЖ" height="50" style="display:block;height:50px;width:auto;" />
                      </td>
                      <td style="color:rgba(255,255,255,0.5);font-size:16px;font-weight:400;padding:0 8px;">|</td>
                      <td style="padding-left:20px;">
                        <img src="${PENSA_LOGO}" alt="ПЕНСА" height="50" style="display:block;height:50px;width:auto;" />
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="color:#ffffff;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding-bottom:8px;">
                  Програма ReАкция
                </td>
              </tr>
              <tr>
                <td style="color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">
                  ${title}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px 16px;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 32px 24px;">
            ${footerNote ? `<p style="color:#9ca3af;font-size:13px;line-height:1.5;margin:0 0 16px;padding-top:16px;border-top:1px solid #e5e7eb;">${footerNote}</p>` : ''}
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;padding-top:16px;">
              <tr>
                <td style="color:#6b7280;font-size:12px;line-height:1.6;">
                  <strong style="color:#7B1818;">Програма ReАкция</strong><br>
                  Българска фондация за жените × Фондация ПЕНСА<br>
                  <a href="https://pensa.club/reaction" style="color:#7B1818;text-decoration:none;">pensa.club/reaction</a> ·
                  <a href="mailto:pensa.club@gmail.com" style="color:#7B1818;text-decoration:none;">pensa.club@gmail.com</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─── Helpers ────────────────────────────────────────────────────────────
const infoRow = (label, value) => value
  ? `<tr>
      <td style="color:#6b7280;font-size:14px;padding:6px 12px 6px 0;vertical-align:top;white-space:nowrap;">${label}</td>
      <td style="color:#1f2937;font-size:14px;font-weight:600;padding:6px 0;vertical-align:top;">${value}</td>
    </tr>`
  : '';

const infoTable = (rows) => `
  <table cellpadding="0" cellspacing="0" style="width:100%;background:#f9fafb;border-radius:8px;padding:12px 16px;margin:16px 0;">
    ${rows}
  </table>`;

const paragraph = (text) => `<p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 12px;">${text}</p>`;

const ctaButton = (url, label) => `
  <table cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      <td style="background:#7B1818;border-radius:8px;padding:12px 28px;">
        <a href="${url}" style="color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;display:inline-block;">${label}</a>
      </td>
    </tr>
  </table>`;

const greeting = (name) => name
  ? `<p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 12px;">Здравейте, <strong>${name}</strong>,</p>`
  : `<p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 12px;">Здравейте,</p>`;

const signature = () => `
  <p style="color:#374151;font-size:15px;line-height:1.7;margin:16px 0 0;">С уважение,<br><strong style="color:#7B1818;">Екипът на ПЕНСА</strong></p>`;

// ─── Topic labels ───────────────────────────────────────────────────────
const topicLabels = {
  digital_literacy: 'Дигитална грамотност',
  media_literacy: 'Медийна грамотност',
  online_safety: 'Онлайн безопасност',
  social_media: 'Социални мрежи',
  e_government: 'Е-правителство',
  health_apps: 'Здравни приложения',
  other: 'Друго',
};

const topicLabel = (topic, topicOther) => {
  const label = topicLabels[topic] || topic;
  return topicOther ? `${label} (${topicOther})` : label;
};

// ═══════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════

/**
 * 1. New request — confirmation to club contact
 */
const requestConfirmation = ({ contactName, clubName, city, topic, topicOther, preferredDate, trackingCode }) => ({
  subject: '✅ Вашата заявка е приета — Програма ReАкция',
  html: wrapTemplate(
    'Заявката ви е приета!',
    greeting(contactName) +
    paragraph('Благодарим Ви, че подадохте заявка за посещение на ментор от <strong>Програма ReАкция</strong> на Фондация ПЕНСА.') +
    paragraph('Вашата заявка е приета и ще бъде разгледана от нашия екип.') +
    infoTable(
      infoRow('Клуб', clubName) +
      infoRow('Град', city) +
      infoRow('Тема', topicLabel(topic, topicOther)) +
      infoRow('Дата', preferredDate) +
      infoRow('Код', `<span style="font-family:monospace;font-size:16px;letter-spacing:2px;color:#7B1818;">${trackingCode}</span>`)
    ) +
    ctaButton(`https://pensa.club/reaction/track/${trackingCode}`, 'Проследи заявката') +
    signature(),
    'Запазете кода за проследяване — ще ви е нужен, за да следите статуса на заявката.'
  ),
});

/**
 * 2. New request — admin notification
 */
const requestAdminNotification = ({ clubName, city, participantsCount, topic, topicOther, preferredDate, contactName, contactPhone, contactEmail, notes, trackingCode }) => ({
  subject: '📋 Нова заявка за посещение — Програма ReАкция',
  html: wrapTemplate(
    'Нова заявка за посещение',
    paragraph('Получена е нова заявка за менторско посещение.') +
    infoTable(
      infoRow('Клуб', clubName) +
      infoRow('Град', city) +
      infoRow('Участници', participantsCount) +
      infoRow('Тема', topicLabel(topic, topicOther)) +
      infoRow('Дата', preferredDate) +
      infoRow('Контакт', contactName) +
      infoRow('Телефон', contactPhone) +
      infoRow('Имейл', `<a href="mailto:${contactEmail}" style="color:#7B1818;">${contactEmail}</a>`) +
      infoRow('Код', `<span style="font-family:monospace;letter-spacing:2px;">${trackingCode}</span>`)
    ) +
    (notes ? `<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;margin:12px 0;">
      <p style="color:#92400e;font-size:14px;margin:0;"><strong>Забележки:</strong> ${notes}</p>
    </div>` : '') +
    ctaButton('https://pensa.club/profile/reaction-admin', 'Отвори в админа')
  ),
});

/**
 * 3. Mentor assigned — email to mentor
 */
const mentorAssigned = ({ mentorName, clubName, city, preferredDate, topic, topicOther, participantsCount, contactName, contactPhone }) => ({
  subject: '🎯 Назначено посещение — Програма ReАкция',
  html: wrapTemplate(
    'Назначено ви е посещение',
    greeting(mentorName) +
    paragraph('Назначено Ви е посещение по <strong>Програма ReАкция</strong>.') +
    infoTable(
      infoRow('Клуб', clubName) +
      infoRow('Град', city) +
      infoRow('Дата', preferredDate) +
      infoRow('Тема', topicLabel(topic, topicOther)) +
      infoRow('Участници', participantsCount) +
      infoRow('Контакт', `${contactName}, ${contactPhone}`)
    ) +
    paragraph('Моля, потвърдете участието си чрез менторския панел.') +
    ctaButton('https://pensa.club/profile/mentor-reaction', 'Менторски панел') +
    signature()
  ),
});

/**
 * 4. Mentor assigned — email to club
 */
const mentorAssignedClub = ({ contactName, clubName, mentorName, preferredDate, trackingCode }) => ({
  subject: '👤 Назначен ментор — Програма ReАкция',
  html: wrapTemplate(
    'Назначен е ментор за вашата заявка',
    greeting(contactName) +
    paragraph('Радваме се да Ви съобщим, че ментор е назначен за Вашата заявка за посещение.') +
    infoTable(
      infoRow('Ментор', mentorName) +
      infoRow('Клуб', clubName) +
      infoRow('Дата', preferredDate)
    ) +
    paragraph('Очаквайте потвърждение от ментора.') +
    ctaButton(`https://pensa.club/reaction/track/${trackingCode}`, 'Проследи заявката') +
    signature()
  ),
});

/**
 * 5. Visit confirmed — email to club
 */
const visitConfirmed = ({ contactName, clubName, preferredDate, topic, topicOther }) => ({
  subject: '🎉 Потвърдено посещение — Програма ReАкция',
  html: wrapTemplate(
    'Посещението е потвърдено!',
    greeting(contactName) +
    paragraph('Вашата заявка за посещение е <strong>потвърдена</strong>!') +
    infoTable(
      infoRow('Клуб', clubName) +
      infoRow('Дата', preferredDate) +
      infoRow('Тема', topicLabel(topic, topicOther))
    ) +
    paragraph('Очакваме ви! Ако имате въпроси, не се колебайте да се свържете с нас.') +
    signature()
  ),
});

/**
 * 6. Visit cancelled — email to club
 */
const visitCancelledClub = ({ contactName, clubName, preferredDate, cancelReason }) => ({
  subject: 'Отказана заявка — Програма ReАкция',
  html: wrapTemplate(
    'Заявката е отказана',
    greeting(contactName) +
    paragraph('За съжаление, Вашата заявка за посещение беше <strong>отказана</strong>.') +
    infoTable(
      infoRow('Клуб', clubName) +
      infoRow('Дата', preferredDate) +
      infoRow('Причина', cancelReason || '—')
    ) +
    paragraph('Ако имате въпроси, моля свържете се с нас на <a href="mailto:pensa.club@gmail.com" style="color:#7B1818;">pensa.club@gmail.com</a>.') +
    signature()
  ),
});

/**
 * 7. Visit cancelled — email to mentor
 */
const visitCancelledMentor = ({ mentorName, clubName, city, preferredDate, cancelReason, cancelledByUser = false }) => ({
  subject: `${cancelledByUser ? 'Отказано посещение от потребител' : 'Отказано посещение'} — Програма ReАкция`,
  html: wrapTemplate(
    cancelledByUser ? 'Потребителят отмени посещението' : 'Посещението е отказано',
    greeting(mentorName) +
    paragraph(cancelledByUser
      ? 'Потребителят отмени заявката за посещение.'
      : 'Посещението, за което бяхте назначени, беше отказано.'
    ) +
    infoTable(
      infoRow('Клуб', clubName) +
      infoRow('Град', city) +
      infoRow('Дата', preferredDate) +
      infoRow('Причина', cancelReason || '—')
    ) +
    signature()
  ),
});

/**
 * 8. Mentor reassigned — email to old mentor
 */
const mentorReassigned = ({ mentorName, clubName, city, preferredDate }) => ({
  subject: 'Промяна в назначение — Програма ReАкция',
  html: wrapTemplate(
    'Промяна в назначение',
    greeting(mentorName) +
    paragraph('Информираме Ви, че назначението Ви за следното посещение е преразпределено на друг ментор.') +
    infoTable(
      infoRow('Клуб', clubName) +
      infoRow('Град', city) +
      infoRow('Дата', preferredDate)
    ) +
    paragraph('Благодарим за разбирането!') +
    signature()
  ),
});

/**
 * 9. Problem reported — email to admin
 */
const problemReport = ({ mentorName, mentorEmail, clubName, city, preferredDate, problemMessage }) => ({
  subject: '⚠️ Проблем с посещение — Програма ReАкция',
  html: wrapTemplate(
    'Докладван проблем',
    paragraph(`Ментор <strong>${mentorName}</strong> (<a href="mailto:${mentorEmail}" style="color:#7B1818;">${mentorEmail}</a>) докладва проблем:`) +
    infoTable(
      infoRow('Клуб', clubName) +
      infoRow('Град', city) +
      infoRow('Дата', preferredDate)
    ) +
    `<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:0 8px 8px 0;margin:12px 0;">
      <p style="color:#991b1b;font-size:14px;margin:0;line-height:1.6;">${problemMessage}</p>
    </div>` +
    ctaButton('https://pensa.club/profile/reaction-admin', 'Отвори в админа')
  ),
});

/**
 * 10. Custom admin email — uses branded template
 */
const customEmail = ({ subject: emailSubject, message }) => ({
  subject: emailSubject,
  html: wrapTemplate(
    emailSubject,
    paragraph(message.replace(/\n/g, '<br>')) +
    signature()
  ),
});

/**
 * 11. User cancelled request — email to club contact
 */
const userCancelledClub = ({ contactName, clubName, city, preferredDate, cancelReason }) => ({
  subject: 'Заявката ви е отменена — Програма ReАкция',
  html: wrapTemplate(
    'Заявката е отменена',
    greeting(contactName) +
    paragraph('Заявката ви за менторско посещение беше <strong>отменена</strong>.') +
    infoTable(
      infoRow('Клуб', clubName) +
      infoRow('Град', city) +
      infoRow('Дата', preferredDate) +
      infoRow('Причина', cancelReason || '—')
    ) +
    paragraph('Ако имате въпроси, свържете се с нас.') +
    signature()
  ),
});

module.exports = {
  requestConfirmation,
  requestAdminNotification,
  mentorAssigned,
  mentorAssignedClub,
  visitConfirmed,
  visitCancelledClub,
  visitCancelledMentor,
  mentorReassigned,
  problemReport,
  customEmail,
  userCancelledClub,
};
