/**
 * Event batch sender — gathers pending rows from notification_queue, groups
 * them per subscriber (by their enabled preferences), renders a single
 * "What's new at Pensa Club" email and delivers it through Zoho.
 */

const { Op } = require('sequelize');
const { wrapNewsletter, wrapDigestBody } = require('./newsletterTemplates');
const { sendNewsletterEmail } = require('./zohoEmails');
const { wrapLinksWithTracking } = require('./newsletterClickTracking');

const RATE_LIMIT_MS = 1500;
const BASE_URL = process.env.PUBLIC_BASE_URL || 'https://pensa.club';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Type → (URL builder, human heading, emoji, singular/plural labels)
const TYPE_META = {
    custom: {
        url: (slug) => (slug && /^https?:\/\//i.test(slug) ? slug : `${BASE_URL}${slug || ''}`),
        heading: '📢 Ъпдейти от екипа',
        singular: 'ъпдейт',
        plural: 'ъпдейта',
    },
    seminar: {
        url: (slug) => `${BASE_URL}/academy/seminars/${slug}`,
        heading: '🎓 Нови семинари',
        singular: 'семинар',
        plural: 'семинара',
    },
    article: {
        url: (slug) => `${BASE_URL}/articles/${slug}`,
        heading: '📰 Нови статии',
        singular: 'статия',
        plural: 'статии',
    },
    course: {
        url: (slug) => `${BASE_URL}/academy/courses/${slug}`,
        heading: '📚 Нови курсове',
        singular: 'курс',
        plural: 'курса',
    },
    initiative: {
        url: (slug) => `${BASE_URL}/initiatives/${slug}`,
        heading: '🚀 Нови инициативи',
        singular: 'инициатива',
        plural: 'инициативи',
    },
    project: {
        url: (slug) => `${BASE_URL}/projects/${slug}`,
        heading: '🧩 Нови проекти',
        singular: 'проект',
        plural: 'проекта',
    },
    publication: {
        url: (slug) => `${BASE_URL}/publications/${slug}`,
        heading: '📘 Нови публикации',
        singular: 'публикация',
        plural: 'публикации',
    },
    club: {
        url: (slug) => `${BASE_URL}/clubs/${slug}`,
        heading: '🏠 Нови клубове',
        singular: 'клуб',
        plural: 'клуба',
    },
};

const TYPE_ORDER = ['seminar', 'article', 'course', 'initiative', 'project', 'publication', 'club', 'custom'];

const trackingPixel = (newsletterId, subscriberId) =>
    `<img src="${BASE_URL}/newsletter/track/${newsletterId}/${subscriberId}" width="1" height="1" style="display:none;width:1px;height:1px;" alt="" />`;

const renderEventItem = (row) => {
    const meta = TYPE_META[row.type];
    const url = row.referenceSlug && meta ? meta.url(row.referenceSlug) : BASE_URL;
    const thumb = row.thumbnail;
    // Description can be plain text OR HTML from tiptap. Render inside a styled
    // wrapper — the HTML-from-tiptap already comes through beautifyBodyHtml-style
    // flat tags that email clients render fine.
    const desc = row.description
        ? `<div style="margin:4px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">${row.description}</div>`
        : '';
    const imgCol = thumb
        ? `<td valign="top" style="width:84px;padding-left:12px;">
              <a href="${url}" style="display:block;text-decoration:none;">
                <img src="${thumb}" alt="" style="width:84px;height:60px;object-fit:cover;border-radius:6px;display:block;border:0;" />
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
            <a href="${url}" style="color:#1f2937;font-size:14px;font-weight:600;text-decoration:none;line-height:1.4;display:block;">${row.referenceTitle || ''}</a>
            ${desc}
          </td>
          ${imgCol}
        </tr>
      </table>
    </td>
  </tr>
</table>`;
};

const renderSectionTitle = (text) =>
    `<p style="color:#1f2937;font-size:15px;font-weight:700;margin:22px 0 8px;padding-bottom:6px;border-bottom:2px solid #E26020;">${text}</p>`;

const buildSubjectLine = (rowsByType) => {
    const parts = TYPE_ORDER
        .filter((t) => (rowsByType[t] || []).length > 0)
        .map((t) => {
            const n = rowsByType[t].length;
            const meta = TYPE_META[t];
            return `${n} ${n === 1 ? meta.singular : meta.plural}`;
        });
    return `Ново в Pensa Club: ${parts.join(', ')}`;
};

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

/**
 * Main entry — processes all pending events, delivers per-subscriber emails,
 * and marks rows as sent. Returns a summary.
 */
async function processEventBatch() {
    const models = require('../sequelize/models/index');
    const {
        notification_queue,
        newsletter,
        newsletter_log,
        subscriber,
        subscriber_preference,
    } = models;

    // 1. Pending rows
    const pending = await notification_queue.findAll({
        where: { status: 'pending' },
        order: [['createdAt', 'ASC']],
    });
    if (pending.length === 0) {
        return { processed: 0, recipients: 0, sent: 0, failed: 0 };
    }

    const rowIds = pending.map((r) => r.id);

    // Group by type for subject / sections
    const rowsByType = pending.reduce((acc, r) => {
        if (!acc[r.type]) acc[r.type] = [];
        acc[r.type].push(r);
        return acc;
    }, {});

    // Unique categories present in this batch
    const batchCategories = [...new Set(pending.map((r) => r.category).filter(Boolean))];

    // 2. Active subscribers with preferences matching the batch categories
    const subscribers = await subscriber.findAll({
        where: { status: 'active' },
        include: [
            {
                model: subscriber_preference,
                as: 'preferences',
                required: false,
                attributes: ['category', 'enabled'],
            },
        ],
    });

    if (subscribers.length === 0) {
        await notification_queue.update(
            { status: 'sent', processedAt: new Date() },
            { where: { id: { [Op.in]: rowIds } } },
        );
        return { processed: pending.length, recipients: 0, sent: 0, failed: 0 };
    }

    // 3. Create a newsletter record (type='event') so everything fits the
    // same stats/logs infra we built in Phase 3.6.
    const subject = buildSubjectLine(rowsByType);
    const record = await newsletter.create({
        title: subject,
        subject,
        body: '',
        type: 'event',
        status: 'sending',
    });

    let sent = 0;
    let failed = 0;
    const subLabel = formatDateLabel(new Date());

    // 4. Per-subscriber delivery
    for (let i = 0; i < subscribers.length; i++) {
        const sub = subscribers[i];

        const enabledCats = new Set(
            (sub.preferences || []).filter((p) => p.enabled).map((p) => p.category),
        );
        // If subscriber has no preferences at all, treat as "all enabled" (default)
        const acceptAll = (sub.preferences || []).length === 0;

        // Filter rows relevant to this subscriber
        const relevantByType = {};
        TYPE_ORDER.forEach((t) => {
            const rows = (rowsByType[t] || []).filter((r) =>
                acceptAll || enabledCats.has(r.category),
            );
            if (rows.length > 0) relevantByType[t] = rows;
        });

        if (Object.keys(relevantByType).length === 0) continue;

        // Build body sections
        const sectionsHtml = TYPE_ORDER
            .filter((t) => relevantByType[t])
            .map((t) => {
                const items = relevantByType[t].map(renderEventItem).join('');
                return `${renderSectionTitle(TYPE_META[t].heading)}${items}`;
            })
            .join('');

        const wrappedBody = wrapDigestBody({
            subscriberName: sub.name || '',
            intro: 'Ето какво ново има в Pensa Club от последните няколко часа:',
            bodyHtml: sectionsHtml,
        }) + trackingPixel(record.id, sub.id);

        const rawHtml = wrapNewsletter(subject, wrappedBody, sub.unsubscribeToken, subLabel);
        const html = wrapLinksWithTracking(rawHtml, record.id, sub.id);

        try {
            await sendNewsletterEmail({ to: sub.email, subject, html });
            sent++;
            await newsletter_log.create({
                newsletterId: record.id,
                subscriberId: sub.id,
                channel: 'email',
                status: 'sent',
                sentAt: new Date(),
            });
        } catch (err) {
            failed++;
            await newsletter_log.create({
                newsletterId: record.id,
                subscriberId: sub.id,
                channel: 'email',
                status: 'failed',
                errorMessage: (err?.message || String(err)).substring(0, 1000),
            });
        }

        if (i < subscribers.length - 1) await sleep(RATE_LIMIT_MS);
    }

    // 5. Mark queue rows as sent and close the newsletter record
    await notification_queue.update(
        { status: 'sent', processedAt: new Date() },
        { where: { id: { [Op.in]: rowIds } } },
    );

    await record.update({
        status: failed > 0 && sent === 0 ? 'failed' : 'sent',
        sentAt: new Date(),
        sentCount: sent,
        failedCount: failed,
    });

    return { processed: pending.length, recipients: subscribers.length, sent, failed };
}

/**
 * Builds a preview of what the NEXT event batch email would look like, WITHOUT
 * sending anything or touching the queue. Useful for the admin dashboard.
 */
async function buildBatchPreview({ subscriberName = '' } = {}) {
    const models = require('../sequelize/models/index');
    const { notification_queue } = models;

    const pending = await notification_queue.findAll({
        where: { status: 'pending' },
        order: [['createdAt', 'ASC']],
    });

    if (pending.length === 0) {
        return {
            pendingCount: 0,
            items: [],
            subject: '',
            html: '',
        };
    }

    const rowsByType = pending.reduce((acc, r) => {
        if (!acc[r.type]) acc[r.type] = [];
        acc[r.type].push(r);
        return acc;
    }, {});

    const subject = buildSubjectLine(rowsByType);

    const sectionsHtml = TYPE_ORDER
        .filter((t) => rowsByType[t])
        .map((t) => {
            const items = rowsByType[t].map(renderEventItem).join('');
            return `${renderSectionTitle(TYPE_META[t].heading)}${items}`;
        })
        .join('');

    const wrappedBody = wrapDigestBody({
        subscriberName,
        intro: 'Ето какво ново има в Pensa Club от последните часове:',
        bodyHtml: sectionsHtml,
    });

    const subLabel = formatDateLabel(new Date());
    const html = wrapNewsletter(subject, wrappedBody, 'PREVIEW_TOKEN', subLabel);

    const items = pending.map((r) => ({
        id: r.id,
        type: r.type,
        referenceId: r.referenceId,
        referenceTitle: r.referenceTitle,
        referenceSlug: r.referenceSlug,
        thumbnail: r.thumbnail,
        category: r.category,
        createdAt: r.createdAt,
    }));

    return {
        pendingCount: pending.length,
        items,
        subject,
        html,
    };
}

module.exports = { processEventBatch, buildBatchPreview };
