/**
 * Newsletter sender — shared between send-now endpoint and scheduled cron.
 * Handles: recipient resolution, HTML rendering with tracking pixel + per-subscriber
 * unsubscribe token, batched Zoho sending with rate limiting, log recording.
 */

const { Op } = require('sequelize');
const { wrapNewsletter, beautifyBodyHtml, wrapDigestBody } = require('./newsletterTemplates');
const { sendNewsletterEmail } = require('./zohoEmails');
const { wrapLinksWithTracking, absolutizeBodyLinks } = require('./newsletterClickTracking');

const formatDateLabel = (date) => {
    try {
        return new Intl.DateTimeFormat('bg-BG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date(date));
    } catch {
        return '';
    }
};

const RATE_LIMIT_MS = 1500; // pause between emails (Zoho-friendly)
const BASE_URL = process.env.PUBLIC_BASE_URL || 'https://pensa.club';
// Prod NPM proxies only `/api/*` to backend, so the tracking pixel + click
// redirect must use the API base. Dev override: PUBLIC_API_BASE_URL.
const API_BASE_URL =
    process.env.PUBLIC_API_BASE_URL || `${BASE_URL.replace(/\/$/, '')}/api`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const trackingPixel = (newsletterId, subscriberId) =>
    `<img src="${API_BASE_URL}/newsletter/track/${newsletterId}/${subscriberId}" width="1" height="1" style="display:none;width:1px;height:1px;" alt="" />`;

const renderUpdatesSection = (text) => {
    if (!text || !String(text).trim()) return '';
    const lines = String(text)
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
    if (lines.length === 0) return '';
    const items = lines
        .map(
            (l) =>
                `<li style="margin:6px 0;color:#374151;font-size:14px;line-height:1.55;">${l
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')}</li>`,
        )
        .join('');
    return `
        <div style="margin:24px 0 8px;padding:18px 20px;background:#fff7ed;border:1px solid #fde4c7;border-radius:10px;">
            <p style="margin:0 0 10px;color:#9a3412;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">📢 Планирани ъпдейти</p>
            <ul style="margin:0;padding-left:20px;">${items}</ul>
        </div>`;
};

/**
 * Sends a newsletter to all matching subscribers. Updates the newsletter record
 * and writes newsletter_log rows.
 *
 * @param {object} opts
 * @param {object} opts.models — sequelize models
 * @param {object} opts.item — newsletter instance (already loaded)
 * @returns {Promise<{ sent: number, failed: number, skipped: number, total: number }>}
 */
async function sendNewsletterToAll({ models, item, renderPerSubscriber = null }) {
    const { newsletter, newsletter_log, subscriber, subscriber_preference } = models;

    const categories = Array.isArray(item.targetCategories) ? item.targetCategories : null;

    // Mark as sending
    await item.update({ status: 'sending' });

    // Segment mode with 0 categories explicitly means "no recipients"
    if (categories && categories.length === 0) {
        await item.update({ status: 'sent', sentAt: new Date(), sentCount: 0, failedCount: 0 });
        return { sent: 0, failed: 0, skipped: 0, total: 0 };
    }

    const subscribers = await subscriber.findAll({
        where: { status: 'active' },
        include:
            categories && categories.length > 0
                ? [
                      {
                          model: subscriber_preference,
                          as: 'preferences',
                          required: true,
                          where: {
                              category: { [Op.in]: categories },
                              enabled: true,
                          },
                      },
                  ]
                : [
                      {
                          model: subscriber_preference,
                          as: 'preferences',
                          required: false,
                          attributes: ['category', 'enabled'],
                      },
                  ],
    });

    if (subscribers.length === 0) {
        await item.update({ status: 'sent', sentAt: new Date(), sentCount: 0, failedCount: 0 });
        return { sent: 0, failed: 0, skipped: 0, total: 0 };
    }

    let sent = 0;
    let failed = 0;
    const totals = subscribers.length;

    for (let i = 0; i < subscribers.length; i++) {
        const sub = subscribers[i];

        let html;
        if (typeof renderPerSubscriber === 'function') {
            const rendered = renderPerSubscriber({
                subscriberName: sub.name || '',
                unsubscribeToken: sub.unsubscribeToken,
                subscriber: sub,
            });
            html = String(rendered || '') + trackingPixel(item.id, sub.id);
        } else {
            const beautified =
                beautifyBodyHtml(item.body || '') +
                renderUpdatesSection(item.platformUpdates);
            const wrappedBody =
                wrapDigestBody({
                    subscriberName: sub.name || '',
                    intro: '',
                    bodyHtml: beautified,
                }) + trackingPixel(item.id, sub.id);

            const subLabel = formatDateLabel(new Date());
            html = wrapNewsletter(
                item.title || 'Pensa Club',
                wrappedBody,
                sub.unsubscribeToken,
                subLabel,
            );
        }
        // Email clients have no document base — absolutize relative hrefs first,
        // then wrap with per-subscriber click tracking.
        html = absolutizeBodyLinks(html);
        html = wrapLinksWithTracking(html, item.id, sub.id);

        const subject = item.subject || item.title || 'Pensa Club';

        try {
            await sendNewsletterEmail({ to: sub.email, subject, html });
            sent++;
            await newsletter_log.create({
                newsletterId: item.id,
                subscriberId: sub.id,
                channel: 'email',
                status: 'sent',
                sentAt: new Date(),
            });
        } catch (err) {
            failed++;
            await newsletter_log.create({
                newsletterId: item.id,
                subscriberId: sub.id,
                channel: 'email',
                status: 'failed',
                errorMessage: (err?.message || String(err)).substring(0, 1000),
            });
        }

        if (i < subscribers.length - 1) await sleep(RATE_LIMIT_MS);
    }

    const finalStatus = failed > 0 && sent === 0 ? 'failed' : 'sent';
    await item.update({
        status: finalStatus,
        sentAt: new Date(),
        sentCount: sent,
        failedCount: failed,
    });

    return { sent, failed, skipped: 0, total: totals };
}

module.exports = { sendNewsletterToAll };
