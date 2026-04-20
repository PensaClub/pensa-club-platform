/**
 * Newsletter email templates — Pensa Club branded
 */

const PENSA_LOGO = 'https://pensa.club/images/homePage/logo.png';
const BASE_URL = 'https://pensa.club';
const BRAND_COLOR = '#E26020';

const wrapNewsletter = (title, bodyHtml, unsubscribeToken) => `
<!DOCTYPE html>
<html lang="bg">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f0ec;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0ec;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#1a1a2e 100%);padding:28px 32px 22px;text-align:center;">
            <img src="${PENSA_LOGO}" alt="Pensa Club" height="40" style="display:inline-block;height:40px;width:auto;margin-bottom:12px;" />
            <p style="color:rgba(255,255,255,0.5);font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Бюлетин</p>
            <p style="color:#ffffff;font-size:20px;font-weight:700;line-height:1.3;margin:0;">${title}</p>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 32px 16px;">
            ${bodyHtml}
          </td>
        </tr>

        <tr>
          <td style="padding:0 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;padding-top:16px;">
              <tr>
                <td style="color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
                  Получавате този имейл, защото сте абониран/а за бюлетина на <strong>Pensa Club</strong>.<br>
                  ${unsubscribeToken ? `<a href="${BASE_URL}/subscribe/preferences/${unsubscribeToken}" style="color:${BRAND_COLOR};text-decoration:none;">Управлявай предпочитанията</a> · <a href="${BASE_URL}/subscribe/unsubscribe/${unsubscribeToken}" style="color:${BRAND_COLOR};text-decoration:none;">Отпиши се</a><br>` : ''}
                  <br>© ${new Date().getFullYear()} Pensa Club · <a href="${BASE_URL}" style="color:${BRAND_COLOR};text-decoration:none;">pensa.club</a>
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

const sectionTitle = (emoji, title) =>
  `<p style="color:#1f2937;font-size:16px;font-weight:700;margin:24px 0 12px;padding-bottom:8px;border-bottom:2px solid ${BRAND_COLOR};">${emoji} ${title}</p>`;

const contentItem = (title, meta, url) =>
  `<table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:12px;">
    <tr>
      <td style="border-left:3px solid ${BRAND_COLOR};padding:8px 0 8px 14px;">
        <a href="${url}" style="color:#1f2937;font-size:14px;font-weight:600;text-decoration:none;line-height:1.4;">${title}</a>
        ${meta ? `<br><span style="color:#6b7280;font-size:12px;">${meta}</span>` : ''}
      </td>
    </tr>
  </table>`;

const upcomingItem = (title, date, url) =>
  `<table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:8px;">
    <tr>
      <td style="padding:6px 0;">
        <span style="color:#6b7280;font-size:12px;font-weight:600;">${date}</span><br>
        <a href="${url}" style="color:#1f2937;font-size:13px;font-weight:500;text-decoration:none;">${title}</a>
      </td>
    </tr>
  </table>`;

/**
 * Weekly Digest — sends every Monday
 */
const weeklyDigest = ({ subscriberName, weekLabel, sections, upcoming, unsubscribeToken }) => {
  let bodyHtml = '';

  if (subscriberName) {
    bodyHtml += `<p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 8px;">Здравейте, <strong>${subscriberName}</strong>,</p>`;
  }
  bodyHtml += `<p style="color:#6b7280;font-size:14px;margin:0 0 20px;">Ето какво се случи в Pensa Club през ${weekLabel}:</p>`;

  for (const section of sections) {
    if (section.items.length === 0) continue;
    bodyHtml += sectionTitle(section.emoji, section.title);
    for (const item of section.items) {
      bodyHtml += contentItem(item.title, item.meta, item.url);
    }
  }

  if (upcoming && upcoming.length > 0) {
    bodyHtml += sectionTitle('📅', 'Предстоящи тази седмица');
    for (const item of upcoming) {
      bodyHtml += upcomingItem(item.title, item.date, item.url);
    }
  }

  bodyHtml += `<p style="color:#374151;font-size:14px;line-height:1.7;margin:24px 0 0;">С уважение,<br><strong style="color:${BRAND_COLOR};">Екипът на Pensa Club</strong></p>`;

  const subject = `📬 Седмично от Pensa Club — ${weekLabel}`;
  const html = wrapNewsletter(`Седмично от Pensa Club`, bodyHtml, unsubscribeToken);

  return { subject, html };
};

module.exports = {
  weeklyDigest,
  wrapNewsletter,
  sectionTitle,
  contentItem,
  upcomingItem,
};
