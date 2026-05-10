// server/src/utils/botCrawlerEmail.js
//
// Builds and sends a per-run summary email for the bot crawler. One email
// per finished run (manual or scheduled), unconditional on findings count
// — the admin asked for full visibility during the test phase. The HTML
// reuses the standard Pensa newsletter wrapper for consistent branding and
// adds a crawler-specific summary card + finding cards.

const { wrapNewsletter } = require('./newsletterTemplates');
const { sendNewsletterEmail } = require('./zohoEmails');

// Default recipient list when a bot has no per-bot emails configured.
// Comma-separated env var; hardcoded fallback keeps the original behaviour
// from before the per-bot list was introduced.
const DEFAULT_RECIPIENTS = (process.env.CRAWLER_DEFAULT_NOTIFICATION_EMAILS || 'pensa.club@gmail.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

const BRAND_COLOR = '#E26020';
const BASE_URL = process.env.PUBLIC_BASE_URL || 'https://pensa.club';
const MAX_FINDINGS_IN_EMAIL = 5;

const resolveRecipients = (bot) => {
    const list = Array.isArray(bot?.notificationEmails) ? bot.notificationEmails : null;
    if (list && list.length > 0) return list;
    return DEFAULT_RECIPIENTS;
};

const escapeHtml = (s) => {
    if (s === null || s === undefined) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const formatDate = (d) => {
    if (!d) return '';
    try {
        return new Date(d).toLocaleString('bg-BG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return String(d);
    }
};

const STATUS_LABEL = {
    success: 'Успех',
    partial_failure: 'Частичен успех',
    failed: 'Грешка',
    running: 'В процес',
};

const STATUS_COLOR = {
    success: '#10b981',
    partial_failure: '#f59e0b',
    failed: '#ef4444',
    running: '#6b7280',
};

// One finding "card" — thumbnail (if available), title, source name, date,
// and a CTA link to open the original article. Layout uses table-based
// HTML for maximum email-client compatibility.
const renderFindingCard = (f) => {
    const title = escapeHtml(f.title || '(без заглавие)');
    const url = escapeHtml(f.externalUrl || '#');
    const sourceName = escapeHtml(f.source?.name || '');
    const dateStr = formatDate(f.publishedAt || f.foundAt);
    const desc = f.description
        ? escapeHtml(String(f.description).slice(0, 180)) + (String(f.description).length > 180 ? '…' : '')
        : '';
    const img = f.imageUrl ? escapeHtml(f.imageUrl) : null;

    return `
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 14px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
      <tr>
        ${img ? `
        <td style="width:120px;vertical-align:top;background:#f9fafb;">
          <a href="${url}" style="display:block;text-decoration:none;">
            <img src="${img}" alt="" style="display:block;width:120px;height:120px;object-fit:cover;border:0;" />
          </a>
        </td>` : ''}
        <td style="padding:14px 16px;vertical-align:top;">
          <a href="${url}" style="display:block;color:#1f2937;font-size:15px;font-weight:700;line-height:1.35;text-decoration:none;margin:0 0 6px;">
            ${title}
          </a>
          ${desc ? `<p style="color:#4b5563;font-size:13px;line-height:1.5;margin:0 0 10px;">${desc}</p>` : ''}
          <table cellpadding="0" cellspacing="0">
            <tr>
              ${sourceName ? `<td style="padding-right:12px;"><span style="color:${BRAND_COLOR};font-size:12px;font-weight:600;">${sourceName}</span></td>` : ''}
              ${dateStr ? `<td><span style="color:#9ca3af;font-size:12px;">${escapeHtml(dateStr)}</span></td>` : ''}
            </tr>
          </table>
          <a href="${url}" style="display:inline-block;margin-top:10px;color:${BRAND_COLOR};font-size:12px;font-weight:600;text-decoration:none;">
            Виж оригинала →
          </a>
        </td>
      </tr>
    </table>`;
};

const renderSummaryCard = ({ bot, run, sourcesScanned, itemsSeen, itemsNew, errors }) => {
    const status = run?.status || 'success';
    const statusColor = STATUS_COLOR[status] || '#6b7280';
    const statusLabel = STATUS_LABEL[status] || status;
    const triggerLabel = run?.trigger === 'manual' ? 'Ръчно стартиране' : 'По разписание';

    return `
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
      <tr>
        <td style="padding:18px 20px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="vertical-align:middle;">
                <p style="color:#6b7280;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin:0 0 4px;">Бот</p>
                <p style="color:#111827;font-size:18px;font-weight:700;margin:0;">${escapeHtml(bot.name)}</p>
              </td>
              <td style="vertical-align:middle;text-align:right;">
                <span style="display:inline-block;padding:4px 12px;background:${statusColor};color:#ffffff;font-size:12px;font-weight:600;border-radius:999px;">
                  ${statusLabel}
                </span>
              </td>
            </tr>
          </table>

          <table cellpadding="0" cellspacing="0" style="width:100%;margin-top:16px;border-top:1px solid #e5e7eb;padding-top:14px;">
            <tr>
              <td style="width:33%;padding:6px 4px;text-align:center;">
                <p style="color:${BRAND_COLOR};font-size:24px;font-weight:700;margin:0;line-height:1;">${itemsNew}</p>
                <p style="color:#6b7280;font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin:6px 0 0;">Нови</p>
              </td>
              <td style="width:33%;padding:6px 4px;text-align:center;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                <p style="color:#374151;font-size:24px;font-weight:700;margin:0;line-height:1;">${itemsSeen}</p>
                <p style="color:#6b7280;font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin:6px 0 0;">Видени</p>
              </td>
              <td style="width:34%;padding:6px 4px;text-align:center;">
                <p style="color:#374151;font-size:24px;font-weight:700;margin:0;line-height:1;">${sourcesScanned}</p>
                <p style="color:#6b7280;font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin:6px 0 0;">Източници</p>
              </td>
            </tr>
          </table>

          <p style="color:#9ca3af;font-size:12px;margin:14px 0 0;">
            ${triggerLabel} · ${formatDate(run?.startedAt)}
            ${errors && errors.length ? `· <span style="color:#dc2626;">${errors.length} грешк${errors.length === 1 ? 'а' : 'и'}</span>` : ''}
          </p>
        </td>
      </tr>
    </table>`;
};

const renderErrorList = (errors) => {
    if (!errors || !errors.length) return '';
    const items = errors.slice(0, 5).map((e) => `
      <li style="color:#7f1d1d;font-size:13px;margin:0 0 4px;">
        <strong>${escapeHtml(e.sourceName || `Source ${e.sourceId}`)}</strong>:
        <span style="color:#991b1b;">${escapeHtml(e.code || 'ERROR')}</span>
        ${e.message ? ` — ${escapeHtml(String(e.message).slice(0, 200))}` : ''}
      </li>
    `).join('');
    return `
      <div style="margin:0 0 24px;padding:14px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;">
        <p style="color:#7f1d1d;font-size:13px;font-weight:700;margin:0 0 8px;">⚠️ Грешки по време на изпълнение</p>
        <ul style="margin:0;padding-left:18px;">
          ${items}
        </ul>
      </div>
    `;
};

// Build the email body for a finished bot run. `findings` is the list of
// crawler_finding rows that were created during this run (may be empty).
const buildBotRunEmail = ({ bot, run, sourcesScanned, itemsSeen, itemsNew, errors, findings }) => {
    const dateLabel = formatDate(run?.startedAt) || formatDate(new Date());
    const subject = itemsNew > 0
        ? `🤖 Бот „${bot.name}" — ${itemsNew} ${itemsNew === 1 ? 'нова находка' : 'нови находки'} (${dateLabel.split(',')[0]})`
        : `🤖 Бот „${bot.name}" — изпълнение без нови находки (${dateLabel.split(',')[0]})`;

    const findingsList = Array.isArray(findings) ? findings.slice(0, MAX_FINDINGS_IN_EMAIL) : [];
    const remaining = (Array.isArray(findings) ? findings.length : 0) - findingsList.length;

    const findingsHtml = findingsList.length === 0
        ? `<p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;text-align:center;padding:24px 0;">
             Това изпълнение не върна нови находки.
           </p>`
        : findingsList.map(renderFindingCard).join('');

    const dashboardUrl = `${BASE_URL}/admin/bot-crawler/${bot.id}`;

    let bodyHtml = '';
    bodyHtml += renderSummaryCard({ bot, run, sourcesScanned, itemsSeen, itemsNew, errors });
    bodyHtml += renderErrorList(errors);

    if (findingsList.length > 0) {
        bodyHtml += `<p style="color:#1f2937;font-size:16px;font-weight:700;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid ${BRAND_COLOR};">📰 Топ ${findingsList.length} ${findingsList.length === 1 ? 'находка' : 'находки'}</p>`;
    }
    bodyHtml += findingsHtml;

    if (remaining > 0) {
        bodyHtml += `<p style="color:#6b7280;font-size:13px;text-align:center;margin:8px 0 16px;">+ още ${remaining} ${remaining === 1 ? 'находка' : 'находки'} в админ панела</p>`;
    }

    bodyHtml += `
      <div style="text-align:center;margin:24px 0 0;">
        <a href="${dashboardUrl}" style="display:inline-block;padding:12px 28px;background:${BRAND_COLOR};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
          Виж всички находки →
        </a>
      </div>
    `;

    const html = wrapNewsletter(
        `Бот „${escapeHtml(bot.name)}" — отчет`,
        bodyHtml,
        null,
        dateLabel
    );

    return { subject, html };
};

// Public: send the email. Swallows errors — we never want a failed email
// to mark the run itself as failed (the run's data is already persisted).
const sendBotRunEmail = async (payload) => {
    try {
        const recipients = resolveRecipients(payload.bot);
        if (!recipients.length) {
            console.warn('[CrawlerEmail] No recipients configured — skipping send.');
            return;
        }
        const { subject, html } = buildBotRunEmail(payload);
        await sendNewsletterEmail({ to: recipients, subject, html });
        console.log(`[CrawlerEmail] Sent run summary for bot ${payload.bot?.id} → ${recipients.join(', ')}`);
    } catch (err) {
        console.error('[CrawlerEmail] Failed to send run email:', err?.message || err);
    }
};

module.exports = {
    sendBotRunEmail,
    buildBotRunEmail,
    resolveRecipients,
    DEFAULT_RECIPIENTS,
};
