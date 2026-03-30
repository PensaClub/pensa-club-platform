/**
 * Forum Community — branded email templates
 * Reuses helpers from reActionEmailTemplates for consistent styling.
 */

const { wrapTemplate, paragraph, ctaButton, greeting, infoTable, infoRow, signature } = require('./reActionEmailTemplates');

const forumEmailTemplates = {

  // 1. New comment on your post
  newComment: ({ userName, commenterName, postTitle, commentPreview, postSlug }) => {
    const postUrl = `https://pensa.club/academy/community/${postSlug}`;
    const preview = commentPreview?.length > 200
      ? commentPreview.substring(0, 200) + '...'
      : commentPreview;

    const body =
      greeting(userName) +
      paragraph(`<strong>${commenterName}</strong> остави коментар на вашата публикация в DigiBridge Общността.`) +
      infoTable(
        infoRow('Публикация', postTitle) +
        infoRow('Коментар', `<em style="color:#4b5563;">"${preview || 'Снимка/медия'}"</em>`)
      ) +
      paragraph('Можете да отговорите или да видите целия коментар от бутона по-долу.') +
      ctaButton(postUrl, 'Виж коментара') +
      signature();

    return {
      subject: `Нов коментар на „${postTitle}"`,
      html: wrapTemplate('Нов коментар', body),
    };
  },

  // 2. Reply to your comment
  newReply: ({ userName, replierName, postTitle, replyPreview, postSlug }) => {
    const postUrl = `https://pensa.club/academy/community/${postSlug}`;
    const preview = replyPreview?.length > 200
      ? replyPreview.substring(0, 200) + '...'
      : replyPreview;

    const body =
      greeting(userName) +
      paragraph(`<strong>${replierName}</strong> отговори на вашия коментар в DigiBridge Общността.`) +
      infoTable(
        infoRow('Публикация', postTitle) +
        infoRow('Отговор', `<em style="color:#4b5563;">"${preview || 'Снимка/медия'}"</em>`)
      ) +
      ctaButton(postUrl, 'Виж отговора') +
      signature();

    return {
      subject: `Нов отговор в „${postTitle}"`,
      html: wrapTemplate('Нов отговор', body),
    };
  },

  // 3. @mention in a comment
  mentioned: ({ userName, mentionerName, postTitle, commentPreview, postSlug }) => {
    const postUrl = `https://pensa.club/academy/community/${postSlug}`;

    const body =
      greeting(userName) +
      paragraph(`<strong>${mentionerName}</strong> ви спомена в коментар в DigiBridge Общността.`) +
      infoTable(
        infoRow('Публикация', postTitle) +
        infoRow('Коментар', `<em style="color:#4b5563;">"${(commentPreview || '').substring(0, 200)}"</em>`)
      ) +
      ctaButton(postUrl, 'Виж коментара') +
      signature();

    return {
      subject: `Споменаха ви в „${postTitle}"`,
      html: wrapTemplate('Споменаха ви', body),
    };
  },

  // 4. Post approved by admin
  postApproved: ({ userName, postTitle, postSlug }) => {
    const postUrl = `https://pensa.club/academy/community/${postSlug}`;

    const body =
      greeting(userName) +
      paragraph('Вашата публикация в DigiBridge Общността беше одобрена и вече е видима за всички!') +
      infoTable(infoRow('Публикация', postTitle)) +
      ctaButton(postUrl, 'Виж публикацията') +
      signature();

    return {
      subject: `Публикацията ви „${postTitle}" е одобрена`,
      html: wrapTemplate('Публикация одобрена', body),
    };
  },

  // 5. Post rejected by admin
  postRejected: ({ userName, postTitle, reason }) => {
    const body =
      greeting(userName) +
      paragraph('Вашата публикация в DigiBridge Общността не беше одобрена.') +
      infoTable(
        infoRow('Публикация', postTitle) +
        (reason ? infoRow('Причина', reason) : '')
      ) +
      paragraph('Можете да редактирате и изпратите публикацията отново.') +
      signature();

    return {
      subject: `Публикацията ви „${postTitle}" не беше одобрена`,
      html: wrapTemplate('Публикация неодобрена', body),
    };
  },
};

module.exports = forumEmailTemplates;
