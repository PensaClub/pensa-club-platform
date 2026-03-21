/**
 * Academy Seminars — branded email templates
 * Reuses helpers from reActionEmailTemplates for consistent styling.
 */

const { wrapTemplate, paragraph, ctaButton, greeting, infoTable, infoRow, signature } = require('./reActionEmailTemplates');

const seminarEmailTemplates = {

  // 1. Registration confirmation for platform users
  registrationConfirmation: ({ userName, seminarTitle, scheduledDate, location, isOnline, meetingLink, mentorName, slug }) => {
    const dateStr = new Date(scheduledDate).toLocaleDateString('bg-BG', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const locationText = isOnline ? 'Онлайн' : (location || 'Уточнява се');

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
          : '')
      ) +
      paragraph('Очакваме ви! Можете да видите детайлите на семинара от бутона по-долу.') +
      ctaButton(`https://pensa.club/academy/seminars/${slug}`, 'Виж семинара') +
      signature();

    return {
      subject: `Записахте се за семинар: ${seminarTitle}`,
      html: wrapTemplate('Записване за семинар', body),
    };
  },

  // 2. Guest notification email
  guestNotification: ({ guestName, seminarTitle, scheduledDate, location, isOnline, mentorName, slug }) => {
    const dateStr = new Date(scheduledDate).toLocaleDateString('bg-BG', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const locationText = isOnline ? 'Онлайн' : (location || 'Уточнява се');

    const body =
      greeting(guestName) +
      paragraph('Записани сте като гост на семинар в DigiBridge Academy!') +
      infoTable(
        infoRow('Семинар', seminarTitle) +
        infoRow('Дата', dateStr) +
        infoRow('Място', locationText) +
        (mentorName ? infoRow('Ментор', mentorName) : '')
      ) +
      paragraph('Регистрирайте се в DigiBridge, за да получите кредити и достъп до повече ресурси.') +
      ctaButton('https://pensa.club/sign-up', 'Регистрирай се') +
      paragraph(`Или вижте детайлите на семинара <a href="https://pensa.club/academy/seminars/${slug}" style="color: #7B1818;">тук</a>.`) +
      signature();

    return {
      subject: `Записани сте за семинар: ${seminarTitle}`,
      html: wrapTemplate('Записване за семинар', body),
    };
  },

  // 3. Attendance confirmation (after mentor marks attendance)
  attendanceConfirmation: ({ userName, seminarTitle, earnedCredits, participationLevel, slug }) => {
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
  mentorNewRegistration: ({ mentorName, studentName, seminarTitle, registeredCount, maxParticipants }) => {
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
