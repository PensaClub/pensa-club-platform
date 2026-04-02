/**
 * Academy Seminars — branded email templates
 * Reuses helpers from reActionEmailTemplates for consistent styling.
 */

const { wrapTemplate, paragraph, ctaButton, greeting, infoTable, infoRow, signature } = require('./reActionEmailTemplates');
const qrBlock = (linkUrl, linkText = 'Линк към семинара') => {
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(linkUrl)}&color=7B1818`;
  return `
    <div style="text-align: center; margin: 20px 0 10px;">
      <img src="${qrImageUrl}" alt="QR код" style="width: 140px; height: 140px;" />
      <p style="margin: 8px 0 0; font-size: 12px; color: #6b7280;">
        <a href="${linkUrl}" style="color: #7B1818; text-decoration: underline;">${linkText}</a>
      </p>
    </div>
  `;
};

const seminarEmailTemplates = {

  // 1. Registration confirmation for platform users
  registrationConfirmation: async ({ userName, seminarTitle, scheduledDate, location, isOnline, meetingLink, meetingPassword, mentorName, slug }) => {
    const dateStr = new Date(scheduledDate).toLocaleDateString('bg-BG', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const locationText = isOnline ? 'Онлайн' : (location || 'Уточнява се');
    const seminarUrl = `https://pensa.club/academy/seminars/${slug}`;


    const body =
      greeting(userName) +
      paragraph('Успешно се записахте за семинар в DigiBridge Academy!') +
      infoTable(
        infoRow('Семинар', seminarTitle) +
        infoRow('Дата', dateStr) +
        infoRow('Място', locationText) +
        (mentorName ? infoRow('Ментор', mentorName) : '') +
        (isOnline && meetingLink
          ? infoRow('Линк за среща', `<a href="${meetingLink}" style="color: #7B1818;">${meetingLink}</a>`)
          : '') +
        (isOnline && meetingPassword
          ? infoRow('Парола', meetingPassword)
          : '')
      ) +
      paragraph('Очакваме ви! Можете да видите детайлите на семинара от бутона по-долу.') +
      ctaButton(seminarUrl, 'Виж семинара') +
      qrBlock(seminarUrl, 'Линк към семинара') +
      signature();

    return {
      subject: `Записахте се за семинар: ${seminarTitle}`,
      html: wrapTemplate('Записване за семинар', body),
    };
  },

  // 2. Guest notification email
  guestNotification: async ({ guestName, seminarTitle, scheduledDate, location, isOnline, meetingLink, meetingPassword, mentorName, slug }) => {
    const dateStr = new Date(scheduledDate).toLocaleDateString('bg-BG', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const locationText = isOnline ? 'Онлайн' : (location || 'Уточнява се');
    const seminarUrl = `https://pensa.club/academy/seminars/${slug}`;


    const body =
      greeting(guestName) +
      paragraph('Записани сте като гост на семинар в DigiBridge Academy!') +
      infoTable(
        infoRow('Семинар', seminarTitle) +
        infoRow('Дата', dateStr) +
        infoRow('Място', locationText) +
        (mentorName ? infoRow('Ментор', mentorName) : '') +
        (isOnline && meetingLink
          ? infoRow('Линк за среща', `<a href="${meetingLink}" style="color: #7B1818;">${meetingLink}</a>`)
          : '') +
        (isOnline && meetingPassword
          ? infoRow('Парола', meetingPassword)
          : '')
      ) +
      paragraph('Регистрирайте се в DigiBridge, за да получите кредити и достъп до повече ресурси.') +
      ctaButton('https://pensa.club/sign-up', 'Регистрирай се') +
      qrBlock(seminarUrl, 'Линк към семинара') +
      signature();

    return {
      subject: `Записани сте за семинар: ${seminarTitle}`,
      html: wrapTemplate('Записване за семинар', body),
    };
  },

  // 3. Attendance confirmation (after mentor marks attendance)
  attendanceConfirmation: async ({ userName, seminarTitle, earnedCredits, participationLevel, slug }) => {
    const levelLabels = { active: 'Активно', moderate: 'Умерено', passive: 'Пасивно' };

    const body =
      greeting(userName) +
      paragraph('Вашето присъствие на семинар беше записано!') +
      infoTable(
        infoRow('Семинар', seminarTitle) +
        infoRow('Ниво на участие', levelLabels[participationLevel] || 'Не е определено') +
        (earnedCredits > 0 ? infoRow('Получени кредити', `+${earnedCredits}`) : '')
      ) +
      paragraph('Благодарим ви за участието!') +
      ctaButton(`https://pensa.club/academy/seminars/${slug}`, 'Виж семинара') +
      signature();

    return {
      subject: `Присъствие записано: ${seminarTitle}`,
      html: wrapTemplate('Присъствие на семинар', body),
    };
  },

  // 4. Mentor notification — new registration
  mentorNewRegistration: async ({ mentorName, studentName, seminarTitle, registeredCount, maxParticipants }) => {
    const spotsInfo = maxParticipants ? `${registeredCount}/${maxParticipants}` : `${registeredCount}`;

    const body =
      greeting(mentorName) +
      paragraph('Нов участник се записа за вашия семинар!') +
      infoTable(
        infoRow('Семинар', seminarTitle) +
        infoRow('Участник', studentName) +
        infoRow('Записани', spotsInfo)
      ) +
      signature();

    return {
      subject: `Нов записан за: ${seminarTitle}`,
      html: wrapTemplate('Ново записване за семинар', body),
    };
  },
};

const ACADEMY_LOGO = 'https://pensa.club/images/homePage/logo.png';

const wrapAcademyTemplate = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="bg">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#0d9488 0%,#059669 100%);padding:28px 32px 20px;text-align:center;">
            <img src="${ACADEMY_LOGO}" alt="DigiBridge Academy" height="48" style="display:inline-block;height:48px;margin-bottom:12px;" />
            <div style="color:#ffffff;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">DigiBridge Academy</div>
            <div style="color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">${title}</div>
          </td>
        </tr>
        <tr><td style="padding:28px 32px 16px;">${bodyHtml}</td></tr>
        <tr>
          <td style="padding:0 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;padding-top:16px;">
              <tr>
                <td style="color:#6b7280;font-size:12px;line-height:1.6;">
                  <strong style="color:#0d9488;">DigiBridge Academy</strong><br>
                  Фондация ПЕНСА<br>
                  <a href="https://pensa.club/academy" style="color:#0d9488;text-decoration:none;">pensa.club/academy</a> ·
                  <a href="mailto:pensa.club@gmail.com" style="color:#0d9488;text-decoration:none;">pensa.club@gmail.com</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

// Invite template for seminar
seminarEmailTemplates.seminarInvite = ({ seminarTitle, scheduledDate, meetingLink, meetingPassword }) => {
  const dateStr = scheduledDate
    ? new Date(scheduledDate).toLocaleDateString('bg-BG', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';

  const body =
    greeting('') +
    paragraph('Каним ви да се присъедините към семинар в <strong>DigiBridge Academy</strong>!') +
    infoTable(
      infoRow('Семинар', seminarTitle || '') +
      infoRow('Дата', dateStr) +
      (meetingLink ? infoRow('Линк за среща', `<a href="${meetingLink}" style="color:#0d9488;">${meetingLink}</a>`) : '') +
      (meetingPassword ? infoRow('Парола', `<strong style="color:#ef4444;font-size:16px;">${meetingPassword}</strong>`) : '')
    ) +
    paragraph('Очакваме ви! Натиснете бутона по-долу за да се присъедините.') +
    ctaButton(meetingLink || 'https://pensa.club/academy/seminars', 'Присъедини се') +
    `<p style="color:#374151;font-size:15px;line-height:1.7;margin:16px 0 0;">С уважение,<br><strong style="color:#0d9488;">Екипът на DigiBridge Academy</strong></p>`;

  return {
    subject: `Покана за семинар: ${seminarTitle || 'DigiBridge Academy'}`,
    html: wrapAcademyTemplate(`Покана за семинар`, body),
  };
};

module.exports = seminarEmailTemplates;
