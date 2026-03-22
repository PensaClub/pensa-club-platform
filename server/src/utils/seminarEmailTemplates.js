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

module.exports = seminarEmailTemplates;
