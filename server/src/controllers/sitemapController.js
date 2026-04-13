const sitemapController = require('express').Router();
const {
    article,
    initiative,
    project,
    publication,
    story,
    club_Club,
    course,
    seminar,
    mentor,
    fact_check_module,
    forum_post,
} = require('../sequelize/models');
const {
    BASE_URL,
    generateStaticSitemap,
    generateContentSitemap,
    generateSitemapIndex,
    generateUrlEntry,
    wrapSitemap,
} = require('../utils/sitemapGenerator');

// ─── Helper to send XML response ──────────────────────────────────────────────
const sendXml = (res, xml) => {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(xml);
};

// ─── SITEMAP INDEX (main entry point) ─────────────────────────────────────────
sitemapController.get('/sitemap.xml', (req, res, next) => {
    try {
        sendXml(res, generateSitemapIndex());
    } catch (err) {
        next(err);
    }
});

// ─── STATIC PAGES ─────────────────────────────────────────────────────────────
sitemapController.get('/sitemap-static.xml', (req, res, next) => {
    try {
        sendXml(res, generateStaticSitemap());
    } catch (err) {
        next(err);
    }
});

// ─── ARTICLES (no draft filter — articles don't have one) ────────────────────
sitemapController.get('/sitemap-articles.xml', async (req, res, next) => {
    try {
        const xml = await generateContentSitemap(
            article,
            {}, // No filter — all articles are published
            '/articles/',
            { priority: 0.8, changefreq: 'monthly' }
        );
        sendXml(res, xml);
    } catch (err) {
        next(err);
    }
});

// ─── INITIATIVES ──────────────────────────────────────────────────────────────
sitemapController.get('/sitemap-initiatives.xml', async (req, res, next) => {
    try {
        const xml = await generateContentSitemap(
            initiative,
            { isDraft: false, publishedAt: { [require('sequelize').Op.ne]: null } },
            '/initiatives/',
            { priority: 0.8, changefreq: 'weekly' }
        );
        sendXml(res, xml);
    } catch (err) {
        next(err);
    }
});

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
sitemapController.get('/sitemap-projects.xml', async (req, res, next) => {
    try {
        const xml = await generateContentSitemap(
            project,
            { isDraft: false },
            '/projects/',
            { priority: 0.8, changefreq: 'weekly' }
        );
        sendXml(res, xml);
    } catch (err) {
        next(err);
    }
});

// ─── PUBLICATIONS ─────────────────────────────────────────────────────────────
sitemapController.get('/sitemap-publications.xml', async (req, res, next) => {
    try {
        const xml = await generateContentSitemap(
            publication,
            { isDraft: false, publishedAt: { [require('sequelize').Op.ne]: null } },
            '/publications/',
            { priority: 0.8, changefreq: 'weekly' }
        );
        sendXml(res, xml);
    } catch (err) {
        next(err);
    }
});

// ─── STORIES ──────────────────────────────────────────────────────────────────
sitemapController.get('/sitemap-stories.xml', async (req, res, next) => {
    try {
        const xml = await generateContentSitemap(
            story,
            { isDraft: false, publishedAt: { [require('sequelize').Op.ne]: null } },
            '/stories/',
            { priority: 0.8, changefreq: 'weekly' }
        );
        sendXml(res, xml);
    } catch (err) {
        next(err);
    }
});

// ─── CLUBS ────────────────────────────────────────────────────────────────────
sitemapController.get('/sitemap-clubs.xml', async (req, res, next) => {
    try {
        const xml = await generateContentSitemap(
            club_Club,
            { isDraft: false, status: 'active' },
            '/clubs/',
            { priority: 0.7, changefreq: 'weekly' }
        );
        sendXml(res, xml);
    } catch (err) {
        next(err);
    }
});

// ─── ACADEMY (courses + seminars + mentors combined) ─────────────────────────
sitemapController.get('/sitemap-academy.xml', async (req, res, next) => {
    try {
        const [courses, seminars, mentors] = await Promise.all([
            course.findAll({
                where: {
                    isDraft: false,
                    publishedAt: { [require('sequelize').Op.ne]: null },
                },
                attributes: ['slug', 'updatedAt'],
                order: [['updatedAt', 'DESC']],
            }),
            seminar.findAll({
                where: {
                    isPublished: true,
                    publishedAt: { [require('sequelize').Op.ne]: null },
                },
                attributes: ['slug', 'updatedAt'],
                order: [['updatedAt', 'DESC']],
            }),
            mentor.findAll({
                where: { status: 'active' },
                attributes: ['id', 'updatedAt'],
                order: [['updatedAt', 'DESC']],
            }),
        ]);

        let entries = '';

        // Courses
        for (const c of courses) {
            if (!c.slug) continue;
            entries += generateUrlEntry(`/academy/courses/${c.slug}`, {
                lastmod: c.updatedAt,
                changefreq: 'monthly',
                priority: 0.8,
            });
        }

        // Seminars
        for (const s of seminars) {
            if (!s.slug) continue;
            entries += generateUrlEntry(`/academy/seminars/${s.slug}`, {
                lastmod: s.updatedAt,
                changefreq: 'weekly',
                priority: 0.8,
            });
        }

        // Mentors (use ID since no slug)
        for (const m of mentors) {
            entries += generateUrlEntry(`/academy/mentors/${m.id}`, {
                lastmod: m.updatedAt,
                changefreq: 'monthly',
                priority: 0.7,
            });
        }

        sendXml(res, wrapSitemap(entries));
    } catch (err) {
        next(err);
    }
});

// ─── FACT-CHECK MODULES ──────────────────────────────────────────────────────
sitemapController.get('/sitemap-factcheck.xml', async (req, res, next) => {
    try {
        const xml = await generateContentSitemap(
            fact_check_module,
            { status: 'published' },
            '/fact-check/',
            { priority: 0.8, changefreq: 'monthly' }
        );
        sendXml(res, xml);
    } catch (err) {
        next(err);
    }
});

// ─── FORUM POSTS ──────────────────────────────────────────────────────────────
sitemapController.get('/sitemap-forum.xml', async (req, res, next) => {
    try {
        const xml = await generateContentSitemap(
            forum_post,
            {
                status: 'published',
                publishedAt: { [require('sequelize').Op.ne]: null },
            },
            '/academy/community/post/',
            { priority: 0.6, changefreq: 'weekly' }
        );
        sendXml(res, xml);
    } catch (err) {
        next(err);
    }
});

module.exports = sitemapController;
