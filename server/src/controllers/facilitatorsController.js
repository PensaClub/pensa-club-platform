// Unified facilitator endpoints for seminars.
// Seminars support three kinds of lecturer:
//   - mentor           (tracked in the `mentors` table; stats + rating apply)
//   - admin            (admin / moderator from user_accounts; no personal stats)
//   - external         (free-form person stored in `external_lecturers`)
//
// This controller exposes:
//   GET    /academy/facilitators/search?q=   → unified search across all 3 sources
//   GET    /academy/external-lecturers?q=    → list / autocomplete
//   POST   /academy/external-lecturers       → create
//   PATCH  /academy/external-lecturers/:id   → update
//   DELETE /academy/external-lecturers/:id   → delete (only if unused)

const facilitatorsController = require('express').Router();
const { Op } = require('sequelize');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');

const {
    mentor,
    user_account,
    user_details,
    external_lecturer,
    seminar_facilitator,
} = require('../sequelize/models');

// ─── 1. UNIFIED FACILITATOR SEARCH ────────────────────────────────────────
// Returns up to `limit` results from each of the 3 sources, in a unified
// shape that FacilitatorPicker can render directly.
facilitatorsController.get(
    '/facilitators/search',
    isAuth,
    rbac.checkPermission('seminar', 'update'),
    async (req, res, next) => {
        try {
            const q = (req.query.q || '').trim();
            const limit = Math.min(parseInt(req.query.limit || '8', 10), 20);

            // 1. Mentors (active only) — source of truth for the `mentors` table
            const mentorWhere = { status: 'active' };
            if (q) {
                mentorWhere[Op.or] = [
                    { name: { [Op.iLike]: `%${q}%` } },
                    { email: { [Op.iLike]: `%${q}%` } },
                ];
            }
            const mentors = await mentor.findAll({
                where: mentorWhere,
                attributes: ['id', 'name', 'email', 'photoUrl', 'specialization', 'rating'],
                order: [['rating', 'DESC'], ['name', 'ASC']],
                limit,
            });

            // 2. Admin / moderator user_accounts
            const adminWhere = { role: { [Op.in]: ['admin', 'moderator'] } };
            const admins = await user_account.findAll({
                where: adminWhere,
                attributes: ['id', 'email', 'role'],
                include: [
                    {
                        model: user_details,
                        as: 'details',
                        required: false,
                        attributes: ['firstName', 'lastName', 'imageURL', 'phone'],
                    },
                ],
                limit: limit * 2, // over-fetch so name filter below can still return up to `limit`
            });

            // Filter admins by q in JS (their name is split across user_details)
            const filteredAdmins = (q
                ? admins.filter((a) => {
                      const d = a.details || {};
                      const full = `${d.firstName || ''} ${d.lastName || ''}`.trim();
                      return (
                          full.toLowerCase().includes(q.toLowerCase()) ||
                          (a.email || '').toLowerCase().includes(q.toLowerCase())
                      );
                  })
                : admins
            ).slice(0, limit);

            // 3. External lecturers
            const externalWhere = {};
            if (q) externalWhere.name = { [Op.iLike]: `%${q}%` };
            const externals = await external_lecturer.findAll({
                where: externalWhere,
                order: [['timesUsed', 'DESC'], ['name', 'ASC']],
                limit,
            });

            // Normalize each source into a unified picker-friendly shape.
            const mentorResults = mentors.map((m) => ({
                type: 'mentor',
                id: m.id,
                name: m.name,
                email: m.email || null,
                photoUrl: m.photoUrl || null,
                specialization: m.specialization || null,
                rating: m.rating || null,
            }));

            const adminResults = filteredAdmins.map((a) => {
                const d = a.details || {};
                const fullName = [d.firstName, d.lastName].filter(Boolean).join(' ').trim();
                return {
                    type: 'admin',
                    id: a.id,
                    name: fullName || a.email,
                    email: a.email || null,
                    photoUrl: d.imageURL || null,
                    role: a.role,
                    phone: d.phone || null,
                };
            });

            const externalResults = externals.map((e) => ({
                type: 'external',
                id: e.id,
                name: e.name,
                email: e.email || null,
                phone: e.phone || null,
                organization: e.organization || null,
                photoUrl: e.photoUrl || null,
                timesUsed: e.timesUsed,
            }));

            res.json({
                success: true,
                mentors: mentorResults,
                admins: adminResults,
                externals: externalResults,
                // Combined flat list too, sorted by type for callers that don't need sections.
                results: [...mentorResults, ...adminResults, ...externalResults],
            });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 2. EXTERNAL LECTURERS — LIST / SEARCH ───────────────────────────────
facilitatorsController.get(
    '/external-lecturers',
    isAuth,
    rbac.checkPermission('seminar', 'update'),
    async (req, res, next) => {
        try {
            const q = (req.query.q || '').trim();
            const where = {};
            if (q) where.name = { [Op.iLike]: `%${q}%` };
            const items = await external_lecturer.findAll({
                where,
                order: [['timesUsed', 'DESC'], ['name', 'ASC']],
                limit: 50,
            });
            res.json({ success: true, items });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 3. EXTERNAL LECTURERS — CREATE ──────────────────────────────────────
facilitatorsController.post(
    '/external-lecturers',
    isAuth,
    rbac.checkPermission('seminar', 'update'),
    async (req, res, next) => {
        try {
            const { name, email, phone, organization, bio, photoUrl } = req.body || {};
            if (!name || !name.trim()) {
                return res.status(400).json({ error: 'Name is required' });
            }
            const created = await external_lecturer.create({
                name: name.trim(),
                email: (email || '').trim() || null,
                phone: (phone || '').trim() || null,
                organization: (organization || '').trim() || null,
                bio: (bio || '').trim() || null,
                photoUrl: (photoUrl || '').trim() || null,
                createdBy: req.user.userId,
            });
            res.status(201).json({ success: true, lecturer: created });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 4. EXTERNAL LECTURERS — UPDATE ──────────────────────────────────────
facilitatorsController.patch(
    '/external-lecturers/:id',
    isAuth,
    rbac.checkPermission('seminar', 'update'),
    async (req, res, next) => {
        try {
            const item = await external_lecturer.findByPk(req.params.id);
            if (!item) return res.status(404).json({ error: 'Not found' });

            const { name, email, phone, organization, bio, photoUrl } = req.body || {};
            if (name !== undefined) item.name = String(name).trim();
            if (email !== undefined) item.email = (email || '').trim() || null;
            if (phone !== undefined) item.phone = (phone || '').trim() || null;
            if (organization !== undefined) item.organization = (organization || '').trim() || null;
            if (bio !== undefined) item.bio = (bio || '').trim() || null;
            if (photoUrl !== undefined) item.photoUrl = (photoUrl || '').trim() || null;

            await item.save();
            res.json({ success: true, lecturer: item });
        } catch (err) {
            next(err);
        }
    }
);

// ─── 5. EXTERNAL LECTURERS — DELETE (only if not in use) ────────────────
facilitatorsController.delete(
    '/external-lecturers/:id',
    isAuth,
    rbac.checkPermission('seminar', 'update'),
    async (req, res, next) => {
        try {
            const item = await external_lecturer.findByPk(req.params.id);
            if (!item) return res.status(404).json({ error: 'Not found' });

            const inUse = await seminar_facilitator.count({
                where: { externalLecturerId: item.id },
            });
            if (inUse > 0) {
                return res.status(409).json({
                    error: 'External lecturer is assigned to seminars and cannot be deleted',
                    assignedCount: inUse,
                });
            }

            await item.destroy();
            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = facilitatorsController;
