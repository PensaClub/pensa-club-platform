// server/src/controllers/platformStatsController.js
//
// Lightweight public endpoint that returns ONLY the counts shown in the
// "PlatformStats" cards on the home page. The previous implementation
// fetched ALL clubs (limit=500), all articles, all initiatives, projects
// and publications just to call .length on them — ~700 KiB transferred
// for 5 numbers. This endpoint runs `COUNT(*)` instead.

const platformStatsController = require('express').Router();
const {
    Club,
    article,
    initiative,
    project,
    publication,
} = require('../sequelize/models');

// Cache the result for 60 seconds — the numbers move slowly and the
// home page is hit hard.
let cache = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60 * 1000;

platformStatsController.get('/counts', async (req, res, next) => {
    try {
        const now = Date.now();
        if (cache && now - cachedAt < CACHE_TTL_MS) {
            return res.status(200).json(cache);
        }

        // Match the existing list filters used by getAllClubs / getAllInitiatives
        // (active + non-draft) so the count matches what the user actually sees.
        const [clubs, articles, initiatives, projects, publications] =
            await Promise.all([
                Club.count({ where: { isDraft: false, status: 'active' } }).catch(() =>
                    Club.count(),
                ),
                article.count(),
                initiative.count({ where: { isDraft: false } }).catch(() =>
                    initiative.count(),
                ),
                project.count({ where: { isDraft: false } }).catch(() =>
                    project.count(),
                ),
                publication.count({ where: { isDraft: false } }).catch(() =>
                    publication.count(),
                ),
            ]);

        cache = { clubs, articles, initiatives, projects, publications };
        cachedAt = now;
        return res.status(200).json(cache);
    } catch (err) {
        next(err);
    }
});

module.exports = platformStatsController;
