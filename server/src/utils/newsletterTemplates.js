/**
 * Newsletter email templates — Pensa Club branded
 */

const PENSA_LOGO = 'https://pensa.club/images/homePage/logo.png';
const BASE_URL = 'https://pensa.club';
const BRAND_COLOR = '#E26020';

const wrapNewsletter = (title, bodyHtml, unsubscribeToken, dateLabel = '') => `
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
            <p style="color:#ffffff;font-size:20px;font-weight:700;line-height:1.3;margin:0 0 ${dateLabel ? '8' : '0'}px;">${title}</p>
            ${dateLabel ? `<p style="color:rgba(255,255,255,0.45);font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin:0;">${dateLabel}</p>` : ''}
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

/**
 * Detects the flat "content block" structure emitted by the AddContentModal
 * on the client (optional <p><img></p>, <p><strong>CAT</strong></p>, <h3>title</h3>,
 * <p>desc</p>, <p><a class="nl-cta">button</a></p>) and replaces each
 * occurrence with a weekly-digest-style table (orange left accent,
 * thumbnail on the right). Run BEFORE per-element style injection.
 *
 * Uses callback-based replacement and tolerates any attribute order (tiptap
 * may output `<a class="..." href="...">` or `<a href="..." class="...">`).
 */
// Description paragraph is optional — tiptap drops empty <p></p>. The desc
// match cannot contain <a> or <p> tags so it can never consume the CTA link.
const NL_BLOCK_RE =
    /(?:<p[^>]*>\s*(<img\s[^>]*\/?>)\s*<\/p>\s*)?<p[^>]*>\s*<strong[^>]*>([\s\S]*?)<\/strong>\s*<\/p>\s*<h3[^>]*>([\s\S]*?)<\/h3>\s*(?:<p[^>]*>((?:(?!<\/?p\b|<a\b)[\s\S])*?)<\/p>\s*)?<p[^>]*>\s*(<a\s[^>]*>)([\s\S]*?)<\/a>\s*<\/p>/gi;

const extractAttr = (tag, name) => {
    if (!tag) return null;
    const re = new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i');
    const m = tag.match(re);
    return m ? m[1] : null;
};

/**
 * Renders one content item in the weekly-digest visual style — orange left
 * accent, bold title acting as the link, optional description and an optional
 * small thumbnail aligned to the right of the title.
 * `category` and `button` are intentionally ignored (digest items show neither).
 */
// eslint-disable-next-line no-unused-vars
const renderDigestBlock = (thumb, _category, title, desc, url, _button) => {
    const cleanDesc = (desc || '').replace(/^(?:<br\s*\/?>|\s)+$/, '').trim();
    const descRow = cleanDesc
        ? `<span style="display:block;margin-top:4px;color:#6b7280;font-size:13px;line-height:1.55;">${cleanDesc}</span>`
        : '';
    const imgCol = thumb
        ? `<td valign="top" style="width:84px;padding-left:12px;">
              <a href="${url}" style="display:block;text-decoration:none;">
                <img src="${thumb}" alt="" style="width:84px;height:60px;object-fit:cover;border-radius:6px;display:block;border:0;outline:none;text-decoration:none;" />
              </a>
           </td>`
        : '';

    return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0;border-collapse:collapse;">
  <tr>
    <td valign="top" style="border-left:3px solid #E26020;padding:8px 0 8px 14px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td valign="top">
            <a href="${url}" style="color:#1f2937;font-size:14px;font-weight:600;text-decoration:none;line-height:1.4;display:block;">${title}</a>
            ${descRow}
          </td>
          ${imgCol}
        </tr>
      </table>
    </td>
  </tr>
</table>`;
};

/**
 * Wraps body HTML with the weekly-digest greeting + intro + signature pattern.
 * Used by manual/scheduled newsletters so they render in the same voice as the
 * automated weekly digest.
 */
const wrapDigestBody = ({ subscriberName, intro, bodyHtml }) => {
    const namePart = subscriberName
        ? ` <strong style="color:#1f2937;font-weight:700;">${subscriberName}</strong>`
        : '';
    const greeting = `<p style="margin:0 0 10px;color:#1f2937;font-size:15px;line-height:1.6;">Здравейте,${namePart},</p>`;
    const introText =
        intro && String(intro).trim()
            ? intro
            : 'Това е персонализиран бюлетин от Pensa Club с подбрана информация специално за вас. Долу ще намерите акценти от платформата, които ви препоръчваме да разгледате.';
    const introHtml = `<p style="margin:0 0 14px;color:#374151;font-size:14.5px;line-height:1.65;">${introText}</p>`;
    const divider = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border-collapse:collapse;"><tr><td style="height:2px;background:#E26020;line-height:2px;font-size:0;">&nbsp;</td></tr></table>`;
    const sig = `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 0;border-collapse:collapse;"><tr><td style="height:1px;background:#e5e7eb;line-height:1px;font-size:0;">&nbsp;</td></tr></table>
        <p style="margin:18px 0 4px;color:#374151;font-size:14px;">С уважение,</p>
        <p style="margin:0;color:#E26020;font-size:14px;font-weight:700;">Екипът на Pensa Club</p>`;
    return `${greeting}${introHtml}${divider}${bodyHtml}${sig}`;
};

/**
 * Applies inline styles to body HTML coming from tiptap (which strips inline styles).
 * Called in the preview endpoint and right before sending to Zoho.
 */
const beautifyBodyHtml = (rawHtml) => {
  if (!rawHtml) return '';
  let html = String(rawHtml);

  // Step 1 — replace flat content-blocks with table-based digest-style blocks.
  html = html.replace(
    NL_BLOCK_RE,
    (match, imgTag, category, title, desc, linkTag, buttonText) => {
      const href = extractAttr(linkTag, 'href');
      const linkClass = extractAttr(linkTag, 'class') || '';
      // Only transform if the link actually carries the nl-cta marker class.
      if (!href || !/\bnl-cta\b/.test(linkClass)) return match;
      const thumb = imgTag ? extractAttr(imgTag, 'src') : null;
      return renderDigestBlock(thumb, category, title, desc, href, buttonText);
    },
  );

  // Step 2 — apply default inline styles only to elements WITHOUT a style attr
  // (negative lookahead prevents double-styling elements inside the digest blocks above).
  html = html.replace(/<h2(?!\s[^>]*\bstyle=)(\s[^>]*)?>/gi,
    '<h2$1 style="margin:26px 0 12px;color:#111827;font-size:20px;font-weight:700;line-height:1.3;">');

  html = html.replace(/<h3(?!\s[^>]*\bstyle=)(\s[^>]*)?>/gi,
    '<h3$1 style="margin:22px 0 10px;color:#1f2937;font-size:17px;font-weight:700;line-height:1.35;">');

  html = html.replace(/<p(?!\s[^>]*\bstyle=)(\s[^>]*)?>/gi,
    '<p$1 style="margin:0 0 12px;color:#374151;font-size:14.5px;line-height:1.65;">');

  html = html.replace(/<img(?!\s[^>]*\bstyle=)(\s[^>]*)\/?>/gi,
    '<img$1 style="max-width:110px;width:auto;height:auto;border-radius:6px;margin:6px 0 8px;display:block;">');

  html = html.replace(/<blockquote(?!\s[^>]*\bstyle=)(\s[^>]*)?>/gi,
    '<blockquote$1 style="margin:18px 0;padding:10px 18px;border-left:3px solid #E26020;background:#fef6f0;color:#374151;border-radius:0 8px 8px 0;">');

  html = html.replace(/<ul(?!\s[^>]*\bstyle=)(\s[^>]*)?>/gi,
    '<ul$1 style="margin:0 0 14px;padding-left:22px;color:#374151;font-size:14.5px;line-height:1.7;">');
  html = html.replace(/<ol(?!\s[^>]*\bstyle=)(\s[^>]*)?>/gi,
    '<ol$1 style="margin:0 0 14px;padding-left:22px;color:#374151;font-size:14.5px;line-height:1.7;">');

  html = html.replace(/<hr(?!\s[^>]*\bstyle=)(\s[^>]*)?\/?>/gi,
    '<hr$1 style="border:none;border-top:1px solid #e5e7eb;margin:22px 0;">');

  // Any leftover nl-cta links that WEREN'T part of a detected block — style as button
  html = html.replace(
    /<a\b(?![^>]*\bstyle=)([^>]*?)class="([^"]*\bnl-cta\b[^"]*)"([^>]*)>/gi,
    '<a$1class="$2"$3 style="display:inline-block;padding:11px 22px;background:#14b8a6;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;margin:4px 0 12px;">',
  );

  // Plain links (no class, no style)
  html = html.replace(
    /<a\b(?![^>]*\bclass=)(?![^>]*\bstyle=)([^>]*)>/gi,
    '<a$1 style="color:#E26020;text-decoration:underline;">',
  );
  // Links with class but not nl-cta and no style — plain link
  html = html.replace(
    /<a\b(?![^>]*\bstyle=)([^>]*?)class="((?:(?!nl-cta)[^"])*)"([^>]*)>/gi,
    '<a$1class="$2"$3 style="color:#E26020;text-decoration:underline;">',
  );

  html = html.replace(/<strong(?!\s[^>]*\bstyle=)(\s[^>]*)?>/gi,
    '<strong$1 style="color:#1f2937;font-weight:700;">');

  return html;
};

/**
 * Monthly Report — sent on the 1st of every month.
 * Inputs:
 *   subscriberName?, monthLabel (e.g. "март 2026"),
 *   stats: { newSeminars, newArticles, newCourses, newInitiatives, newProjects, newPublications, newClubs, newUsers },
 *   topSeminars: [{ id, title, slug, thumbnailUrl, attendanceCount }],
 *   topArticles: [{ id, title, slug, thumbnailUrl, views, isFallback }],
 *   topCourses: [{ id, title, slug, thumbnailUrl, views, isFallback }],
 *   upcoming: { seminars: [...], initiatives: [...] },
 *   platformUpdatesHtml?: admin-curated HTML block,
 *   unsubscribeToken
 */
const MONTH_NAMES_BG = [
  'януари', 'февруари', 'март', 'април', 'май', 'юни',
  'юли', 'август', 'септември', 'октомври', 'ноември', 'декември',
];

const formatMonthLabel = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${MONTH_NAMES_BG[d.getMonth()]} ${d.getFullYear()}`;
};

const statCard = (value, label, accent = BRAND_COLOR) => `
  <td style="padding:0 6px;vertical-align:top;width:25%;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;border-top:3px solid ${accent};">
      <tr>
        <td style="padding:14px 10px;text-align:center;">
          <p style="margin:0;color:${accent};font-size:26px;font-weight:800;line-height:1;font-family:'Segoe UI',Arial,sans-serif;">${value}</p>
          <p style="margin:6px 0 0;color:#6b7280;font-size:11px;font-weight:600;line-height:1.3;text-transform:uppercase;letter-spacing:0.04em;">${label}</p>
        </td>
      </tr>
    </table>
  </td>
`;

const topItemRow = (item, metaText, fallbackImg) => {
  const href = `${BASE_URL}/${item.slug || item.id || ''}`;
  const thumb = item.thumbnailUrl || fallbackImg;
  const metaHtml = metaText
    ? `<p style="margin:4px 0 0;color:#6b7280;font-size:12px;font-weight:600;">${metaText}</p>`
    : '';
  const imgCol = thumb
    ? `<td width="84" valign="top" style="width:84px;padding-left:12px;">
         <img src="${thumb}" alt="" width="84" height="60" style="width:84px;height:60px;border-radius:6px;display:block;object-fit:cover;" />
       </td>`
    : '';
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px;border-collapse:collapse;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;">
    <tr>
      <td style="padding:12px 14px;border-left:3px solid ${BRAND_COLOR};border-radius:10px 0 0 10px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td valign="top">
              <a href="${href}" style="color:#1f2937;font-size:14px;font-weight:700;text-decoration:none;line-height:1.35;">${item.title || '—'}</a>
              ${metaHtml}
            </td>
            ${imgCol}
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
};

const monthlyReport = ({
  subscriberName,
  monthLabel,
  stats,
  topSeminars = [],
  topArticles = [],
  topCourses = [],
  upcoming,
  platformUpdatesHtml = '',
  unsubscribeToken,
}) => {
  const safeStats = stats || {};
  const namePart = subscriberName
    ? ` <strong style="color:#1f2937;font-weight:700;">${subscriberName}</strong>`
    : '';
  const greeting = `<p style="margin:0 0 10px;color:#1f2937;font-size:15px;line-height:1.6;">Здравейте,${namePart},</p>`;
  const intro = `<p style="margin:0 0 14px;color:#374151;font-size:14.5px;line-height:1.65;">Представяме Ви обобщение на отминалия месец в Pensa Club — новото съдържание, най-популярните материали и какво предстои.</p>`;
  const divider = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border-collapse:collapse;"><tr><td style="height:2px;background:${BRAND_COLOR};line-height:2px;font-size:0;">&nbsp;</td></tr></table>`;

  const statsBlock = `
    ${sectionTitle('📊', `Числата за ${monthLabel}`)}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;border-collapse:separate;border-spacing:0;">
      <tr>
        ${statCard(safeStats.newSeminars || 0, 'Нови семинари')}
        ${statCard(safeStats.newArticles || 0, 'Нови статии', '#14b8a6')}
        ${statCard(safeStats.newCourses || 0, 'Нови курсове')}
        ${statCard(safeStats.newUsers || 0, 'Нови потребители', '#14b8a6')}
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 18px;border-collapse:separate;border-spacing:0;">
      <tr>
        ${statCard(safeStats.newInitiatives || 0, 'Инициативи')}
        ${statCard(safeStats.newProjects || 0, 'Проекти', '#14b8a6')}
        ${statCard(safeStats.newPublications || 0, 'Публикации')}
        ${statCard(safeStats.newClubs || 0, 'Нови клубове', '#14b8a6')}
      </tr>
    </table>
  `;

  const topSeminarsBlock = topSeminars.length
    ? `${sectionTitle('🎓', 'Най-посещавани семинари')}
       ${topSeminars.map((s) => topItemRow(
         { ...s, slug: s.slug ? `academy/seminars/${s.slug}` : null },
         `${s.attendanceCount || 0} присъствали`,
         null,
       )).join('')}`
    : '';

  const topArticlesBlock = topArticles.length
    ? `${sectionTitle('📰', 'Най-четени статии')}
       ${topArticles.map((a) => topItemRow(
         { ...a, slug: a.slug ? `articles/${a.slug}` : null },
         a.views ? `${a.views} прочитания` : (a.isFallback ? 'ново за месеца' : ''),
         null,
       )).join('')}`
    : '';

  const topCoursesBlock = topCourses.length
    ? `${sectionTitle('📚', 'Популярни курсове')}
       ${topCourses.map((c) => topItemRow(
         { ...c, slug: c.slug ? `academy/courses/${c.slug}` : null },
         c.views ? `${c.views} прочитания` : (c.isFallback ? 'ново за месеца' : ''),
         null,
       )).join('')}`
    : '';

  const upcomingSeminars = upcoming?.seminars || [];
  const upcomingInitiatives = upcoming?.initiatives || [];
  const upcomingBlock = upcomingSeminars.length || upcomingInitiatives.length
    ? `${sectionTitle('📅', 'Какво предстои следващия месец')}
       ${upcomingSeminars.slice(0, 5).map((s) => upcomingItem(
         s.title,
         s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' }) : '',
         `${BASE_URL}/academy/seminars/${s.slug}`,
       )).join('')}
       ${upcomingInitiatives.slice(0, 3).map((i) => upcomingItem(
         i.title,
         'Инициатива',
         `${BASE_URL}/initiatives/${i.slug}`,
       )).join('')}`
    : '';

  const platformBlock = platformUpdatesHtml && String(platformUpdatesHtml).trim()
    ? `${sectionTitle('🛠️', 'Планирани ъпдейти на платформата')}
       <div style="color:#374151;font-size:14px;line-height:1.65;margin:0 0 8px;">${platformUpdatesHtml}</div>`
    : '';

  const signature = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 0;border-collapse:collapse;"><tr><td style="height:1px;background:#e5e7eb;line-height:1px;font-size:0;">&nbsp;</td></tr></table>
    <p style="margin:18px 0 4px;color:#374151;font-size:14px;">С уважение,</p>
    <p style="margin:0;color:${BRAND_COLOR};font-size:14px;font-weight:700;">Екипът на Pensa Club</p>`;

  const body = `${greeting}${intro}${divider}${statsBlock}${topSeminarsBlock}${topArticlesBlock}${topCoursesBlock}${upcomingBlock}${platformBlock}${signature}`;

  const title = `📊 Месечно от Pensa Club — ${monthLabel}`;
  return wrapNewsletter(title, body, unsubscribeToken, monthLabel);
};

module.exports = {
  weeklyDigest,
  wrapNewsletter,
  sectionTitle,
  contentItem,
  upcomingItem,
  beautifyBodyHtml,
  wrapDigestBody,
  monthlyReport,
  formatMonthLabel,
};
