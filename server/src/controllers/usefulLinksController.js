const usefulLinksController = require('express').Router();
const customError = require('../utils/customError');
const { useful_link, user_account } = require('../sequelize/models');
const isAuth = require('../middlewares/isAuth');
const { checkPermission } = require('../middlewares/rbac');
const { Op, literal } = require('sequelize');
const rateLimiter = require('../middlewares/rateLimiter');

const linkAttributes = [
    'id', 'slug', 'title', 'titleEn', 'titleDe',
    'description', 'descriptionEn', 'descriptionDe',
    'url', 'imageUrl', 'firebaseImagePath', 'category', 'viewCount',
    'isActive', 'displayOrder', 'createdBy',
    'createdAt', 'updatedAt',
];

const generateSlug = (title) => {
    const bgToLatin = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
        'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
        'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': '',
        'ю': 'yu', 'я': 'ya',
    };

    return title
        .toLowerCase()
        .trim()
        .split('')
        .map(char => bgToLatin[char] || char)
        .join('')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 80);
};

// GET /useful-links/all — Active links with pagination (public)
usefulLinksController.get('/all', isAuth.allowGuest, checkPermission('usefulLink', 'read'), async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 12,
            search = '',
            category = '',
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        const whereClause = { isActive: true };

        if (category && category !== 'all') {
            whereClause.category = category;
        }

        if (search.trim()) {
            whereClause[Op.or] = [
                { title: { [Op.iLike]: `%${search.trim()}%` } },
                { titleEn: { [Op.iLike]: `%${search.trim()}%` } },
                { titleDe: { [Op.iLike]: `%${search.trim()}%` } },
                { description: { [Op.iLike]: `%${search.trim()}%` } },
                { descriptionEn: { [Op.iLike]: `%${search.trim()}%` } },
                { descriptionDe: { [Op.iLike]: `%${search.trim()}%` } },
            ];
        }

        const { count, rows } = await useful_link.findAndCountAll({
            where: whereClause,
            attributes: linkAttributes,
            order: [
                [literal('CASE WHEN "displayOrder" = 0 THEN 1 ELSE 0 END'), 'ASC'],
                ['displayOrder', 'ASC'],
                ['createdAt', 'DESC'],
            ],
            limit: limitNum,
            offset,
        });

        return res.json({
            links: rows,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: count,
                totalPages: Math.ceil(count / limitNum),
                hasMore: offset + rows.length < count,
            },
        });
    } catch (err) {
        next(err);
    }
});

// GET /useful-links/admin/all — All links with pagination + search (admin)
usefulLinksController.get('/admin/all', isAuth, checkPermission('usefulLink', 'readAll'), async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 12,
            search = '',
            category = '',
            status = '',
            sortBy = 'newest',
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        const whereClause = {};

        if (search.trim()) {
            whereClause[Op.or] = [
                { title: { [Op.iLike]: `%${search.trim()}%` } },
                { titleEn: { [Op.iLike]: `%${search.trim()}%` } },
                { titleDe: { [Op.iLike]: `%${search.trim()}%` } },
                { url: { [Op.iLike]: `%${search.trim()}%` } },
            ];
        }

        if (category && category !== 'all') {
            whereClause.category = category;
        }

        if (status === 'active') {
            whereClause.isActive = true;
        } else if (status === 'inactive') {
            whereClause.isActive = false;
        }

        let order;
        switch (sortBy) {
            case 'oldest':
                order = [['createdAt', 'ASC']];
                break;
            case 'name':
                order = [['title', 'ASC']];
                break;
            case 'mostViewed':
                order = [['viewCount', 'DESC']];
                break;
            case 'newest':
            default:
                order = [['createdAt', 'DESC']];
                break;
        }

        const { count, rows } = await useful_link.findAndCountAll({
            where: whereClause,
            attributes: linkAttributes,
            order,
            limit: limitNum,
            offset,
        });

        return res.json({
            links: rows,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: count,
                totalPages: Math.ceil(count / limitNum),
            },
        });
    } catch (err) {
        next(err);
    }
});

// GET /useful-links/single/:id — Single link
usefulLinksController.get('/single/:id', isAuth.allowGuest, checkPermission('usefulLink', 'read'), async (req, res, next) => {
    try {
        const linkId = parseInt(req.params.id);
        const foundLink = await useful_link.findByPk(linkId, {
            attributes: linkAttributes,
        });

        if (!foundLink) {
            throw new customError({
                message: 'Link not found',
                statusCode: 404,
            });
        }

        return res.json(foundLink);
    } catch (err) {
        next(err);
    }
});

// POST /useful-links/create — Create link
usefulLinksController.post('/create', isAuth, checkPermission('usefulLink', 'create'), async (req, res, next) => {
    try {
        const {
            title, titleEn, titleDe,
            description, descriptionEn, descriptionDe,
            url, imageUrl, firebaseImagePath, category, displayOrder, isActive, slug: customSlug,
        } = req.body;

        const errors = {};
        if (!title) errors.title = 'Title is required';
        if (!url) errors.url = 'URL is required';

        if (Object.keys(errors).length > 0) {
            throw new customError({
                message: 'Validation errors',
                statusCode: 400,
                details: errors,
            });
        }

        let slug = customSlug || generateSlug(title);

        const existingLink = await useful_link.findOne({ where: { slug } });
        if (existingLink) {
            slug = `${slug}-${Date.now()}`;
        }

        const newLink = await useful_link.sequelize.transaction(async (t) => {
            const created = await useful_link.create(
                {
                    slug,
                    title,
                    titleEn: titleEn || null,
                    titleDe: titleDe || null,
                    description: description || null,
                    descriptionEn: descriptionEn || null,
                    descriptionDe: descriptionDe || null,
                    url,
                    imageUrl: imageUrl || null,
                    firebaseImagePath: firebaseImagePath || null,
                    category: category || 'general',
                    displayOrder: displayOrder || 0,
                    isActive: isActive !== undefined ? isActive : true,
                    createdBy: req.user.userId,
                },
                { transaction: t }
            );
            return created;
        });

        const createdLink = await useful_link.findByPk(newLink.id, {
            attributes: linkAttributes,
        });

        return res.status(201).json(createdLink);
    } catch (err) {
        next(err);
    }
});

// PUT /useful-links/:id — Update link
usefulLinksController.put('/:id', isAuth, checkPermission('usefulLink', 'update'), async (req, res, next) => {
    try {
        const linkId = parseInt(req.params.id);
        const existingLink = await useful_link.findByPk(linkId);

        if (!existingLink) {
            throw new customError({
                message: 'Link not found',
                statusCode: 404,
            });
        }

        const {
            title, titleEn, titleDe,
            description, descriptionEn, descriptionDe,
            url, imageUrl, firebaseImagePath, category, displayOrder, isActive, slug,
        } = req.body;

        if (slug && slug !== existingLink.slug) {
            const slugExists = await useful_link.findOne({
                where: { slug, id: { [Op.ne]: linkId } },
            });
            if (slugExists) {
                throw new customError({
                    message: 'A link with this slug already exists',
                    statusCode: 409,
                });
            }
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (titleEn !== undefined) updateData.titleEn = titleEn;
        if (titleDe !== undefined) updateData.titleDe = titleDe;
        if (description !== undefined) updateData.description = description;
        if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn;
        if (descriptionDe !== undefined) updateData.descriptionDe = descriptionDe;
        if (url !== undefined) updateData.url = url;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (firebaseImagePath !== undefined) updateData.firebaseImagePath = firebaseImagePath;
        if (category !== undefined) updateData.category = category;
        if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (slug !== undefined) updateData.slug = slug;

        await existingLink.update(updateData);

        const updatedLink = await useful_link.findByPk(linkId, {
            attributes: linkAttributes,
        });

        return res.json(updatedLink);
    } catch (err) {
        next(err);
    }
});

// DELETE /useful-links/:id — Delete link
usefulLinksController.delete('/:id', isAuth, checkPermission('usefulLink', 'delete'), async (req, res, next) => {
    try {
        const linkId = parseInt(req.params.id);
        const linkToDelete = await useful_link.findByPk(linkId);

        if (!linkToDelete) {
            throw new customError({
                message: 'Link not found',
                statusCode: 404,
            });
        }

        await linkToDelete.destroy();

        return res.json({ message: 'Link deleted successfully' });
    } catch (err) {
        next(err);
    }
});

// POST /useful-links/:id/track-view — Increment viewCount
usefulLinksController.post('/:id/track-view', isAuth.allowGuest, rateLimiter, async (req, res, next) => {
    try {
        const linkId = parseInt(req.params.id);
        const link = await useful_link.findByPk(linkId);

        if (!link) {
            throw new customError({
                message: 'Link not found',
                statusCode: 404,
            });
        }

        await link.increment('viewCount');

        return res.json({ viewCount: link.viewCount + 1 });
    } catch (err) {
        next(err);
    }
});

// PATCH /useful-links/:id/toggle-active — Toggle isActive
usefulLinksController.patch('/:id/toggle-active', isAuth, checkPermission('usefulLink', 'update'), async (req, res, next) => {
    try {
        const linkId = parseInt(req.params.id);
        const link = await useful_link.findByPk(linkId);

        if (!link) {
            throw new customError({
                message: 'Link not found',
                statusCode: 404,
            });
        }

        await link.update({ isActive: !link.isActive });

        const updatedLink = await useful_link.findByPk(linkId, {
            attributes: linkAttributes,
        });

        return res.json(updatedLink);
    } catch (err) {
        next(err);
    }
});

module.exports = usefulLinksController;
