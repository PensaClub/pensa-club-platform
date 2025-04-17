const articleController = require('express').Router();
const customError = require('../utils/customError');
const { article, mainImage, section, sectionImage, user_details } = require('../sequelize/models');
const isAuth = require('../middlewares/isAuth');
const { checkPermission } = require('../middlewares/rbac');
const { updateArticleRelationships } = require('../utils/articleUtils');
const { Op, where } = require('sequelize');
const rateLimiter = require('../middlewares/rateLimiter');

const articleIncludeConfig = [
    {
        model: mainImage,
        as: 'mainImage',
        attributes: ['id', 'type', 'sources', 'alt', 'thumbnail'],
    },
    {
        model: section,
        as: 'sections',
        attributes: ['id', 'title', 'content', 'order'],
        include: [
            {
                model: sectionImage,
                attributes: ['id', 'src', 'alt', 'caption'],
            },
        ],
        order: [['order', 'ASC']],
    },
    {
        model: article,
        as: 'relatedArticle',
        attributes: ['id', 'title', 'slug'],
    },
    {
        model: article,
        as: 'nextArticle',
        attributes: ['id', 'title', 'slug'],
    },
    {
        model: article,
        as: 'previousArticle',
        attributes: ['id', 'title', 'slug'],
    },
];

const articleAttributes = ['id', 'title', 'slug', 'summary', 'author', 'publishDate', 'tags', 'updatedBy', 'createdAt', 'updatedAt'];

articleController.get('/all', checkPermission('article', 'read'), async (req, res, next) => {
    try {
        const articles = await article.findAll({
            include: articleIncludeConfig,
            attributes: articleAttributes,
            order: [
                ['publishDate', 'DESC'],
                [{ model: section, as: 'sections' }, 'order', 'ASC'],
            ],
        });

        return res.json(articles || []);
    } catch (err) {
        console.error('Error in /all endpoint:', err);
        next(err);
    }
});

articleController.get('/single/:id', isAuth.allowGuest, rateLimiter, checkPermission('article', 'read'), async (req, res, next) => {
    try {
        const articleId = parseInt(req.params.id);
        if (isNaN(articleId)) {
            throw new customError({
                message: 'Invalid article ID',
                statusCode: 400,
            });
        }

        const foundArticle = await article.findByPk(articleId, {
            include: articleIncludeConfig,
            attributes: articleAttributes,
        });

        if (!foundArticle) {
            throw new customError({
                message: 'Article not found',
                statusCode: 404,
            });
        }

        return res.json(foundArticle);
    } catch (err) {
        next(err);
    }
});

articleController.post('/create', isAuth, checkPermission('article', 'create'), async (req, res, next) => {
    try {
        const {
            title,
            slug,
            summary,
            author,
            publishDate,
            mainImage: mainImageData,
            sections,
            tags,
            relatedArticleId,
            nextArticleId,
            previousArticleId,
        } = req.body;

        const errors = {};
        if (!title) errors.title = 'Title is required';
        if (!slug) errors.slug = 'Slug is required';

        if (Object.keys(errors).length > 0) {
            throw new customError({
                message: 'Validation errors',
                statusCode: 400,
                details: errors,
            });
        }

        const existingArticle = await article.findOne({ where: { slug } });
        if (existingArticle) {
            throw new customError({
                message: `Article with slug '${slug}' already exists`,
                statusCode: 409,
            });
        }

        const userDetails = await user_details.findOne({
            where: { user_accounts_id: req.user.userId },
        });

        const newArticle = await article.sequelize.transaction(async (t) => {
            const created = await article.create(
                {
                    title,
                    slug,
                    summary,
                    author: author,
                    publishDate,
                    tags: tags || [],
                    updatedBy: userDetails.username,
                    relatedArticleId,
                    nextArticleId,
                    previousArticleId,
                },
                { transaction: t }
            );

            if (mainImageData) {
                await mainImage.create(
                    {
                        ...mainImageData,
                        articleId: created.id,
                    },
                    { transaction: t }
                );
            }

            if (sections && sections.length > 0) {
                await Promise.all(
                    sections.map(async (sectionData, index) => {
                        const newSection = await section.create(
                            {
                                title: sectionData.title ?? null,
                                content: sectionData.content ?? null,
                                order: sectionData.order || index + 1,
                                articleId: created.id,
                            },
                            { transaction: t }
                        );

                        if (sectionData.image && Array.isArray(sectionData.image)) {
                            await Promise.all(
                                sectionData.image.map(async (imageData) => {
                                    await sectionImage.create(
                                        {
                                            src: imageData.src ?? null,
                                            alt: imageData.alt ?? null,
                                            caption: imageData.caption ?? null,
                                            sectionId: newSection.id,
                                        },
                                        { transaction: t }
                                    );
                                })
                            );
                        }
                    })
                );
            }

            await updateArticleRelationships(created, { relatedArticleId, nextArticleId, previousArticleId }, t);

            return created;
        });

        const createdArticle = await article.findByPk(newArticle.id, {
            include: articleIncludeConfig,
            attributes: articleAttributes,
        });

        return res.status(201).json(createdArticle);
    } catch (err) {
        next(err);
    }
});

articleController.put('/:id', isAuth, checkPermission('article', 'update'), async (req, res, next) => {
    try {
        const articleId = parseInt(req.params.id);
        if (isNaN(articleId)) {
            throw new customError({
                message: 'Invalid article ID',
                statusCode: 400,
            });
        }

        const { title, slug, summary, author, mainImage: mainImageData, sections, tags, relatedArticleId, nextArticleId, previousArticleId } = req.body;

        const existingArticle = await article.findByPk(articleId, {
            include: articleIncludeConfig,
            attributes: articleAttributes,
        });

        if (!existingArticle) {
            throw new customError({
                message: 'Article not found',
                statusCode: 404,
            });
        }

        if (slug && slug !== existingArticle.slug) {
            const slugExists = await article.findOne({
                where: {
                    slug,
                    id: { [Op.ne]: articleId },
                },
            });
            if (slugExists) {
                throw new customError('Article with this slug already exists', 400);
            }
        }

        const userDetails = await user_details.findOne({
            where: { user_accounts_id: req.user.userId },
        });

        const updatedArticle = await article.sequelize.transaction(async (t) => {
            await updateArticleRelationships(existingArticle, { relatedArticleId, nextArticleId, previousArticleId }, t);

            const articleUpdate = {
                ...(title !== undefined && { title }),
                ...(slug !== undefined && { slug }),
                ...(summary !== undefined && { summary }),
                ...(author !== undefined && { author }),
                ...(tags !== undefined && { tags }),
                updatedBy: userDetails.username,
            };

            await existingArticle.update(articleUpdate, { transaction: t });

            if (mainImageData) {
                if (existingArticle.mainImage) {
                    await existingArticle.mainImage.update(mainImageData, { transaction: t });
                } else {
                    await mainImage.create(
                        {
                            ...mainImageData,
                            articleId: existingArticle.id,
                        },
                        { transaction: t }
                    );
                }
            }

            if (sections && Array.isArray(sections)) {
                const existingSections = await section.findAll({
                    where: { articleId: existingArticle.id },
                    include: [sectionImage],
                    transaction: t,
                });

                const existingSectionIds = new Set(existingSections.map((s) => s.id));
                const newSectionIds = new Set(sections.filter((s) => s.id).map((s) => s.id));

                const sectionsToDelete = existingSections.filter((s) => !newSectionIds.has(s.id));

                if (sectionsToDelete.length > 0) {
                    await section.destroy({
                        where: {
                            id: sectionsToDelete.map((s) => s.id),
                        },
                        transaction: t,
                    });
                }

                for (const sectionData of sections) {
                    if (!sectionData.id) {
                        const newSection = await section.create(
                            {
                                title: sectionData.title ?? null,
                                content: sectionData.content ?? null,
                                order: sectionData.order,
                                articleId: existingArticle.id,
                            },
                            { transaction: t }
                        );

                        if (sectionData.image && Array.isArray(sectionData.image)) {
                            await Promise.all(
                                sectionData.image.map(async (imageData) => {
                                    await sectionImage.create(
                                        {
                                            src: imageData.src ?? null,
                                            alt: imageData.alt ?? null,
                                            caption: imageData.caption ?? null,
                                            sectionId: newSection.id,
                                        },
                                        { transaction: t }
                                    );
                                })
                            );
                        }
                    } else if (existingSectionIds.has(sectionData.id)) {
                        const existingSection = existingSections.find((s) => s.id === sectionData.id);

                        await existingSection.update(
                            {
                                title: sectionData.title ?? null,
                                content: sectionData.content ?? null,
                                order: sectionData.order,
                            },
                            { transaction: t }
                        );

                        if (sectionData.image && Array.isArray(sectionData.image)) {
                            await sectionImage.destroy({
                                where: {
                                    sectionId: existingSection.id,
                                    id: {
                                        [Op.notIn]: sectionData.image.filter((img) => img.id).map((img) => img.id),
                                    },
                                },
                                transaction: t,
                            });

                            await Promise.all(
                                sectionData.image.map(async (imageData) => {
                                    if (imageData.id) {
                                        await sectionImage.update(
                                            {
                                                src: imageData.src ?? null,
                                                alt: imageData.alt ?? null,
                                                caption: imageData.caption ?? null,
                                            },
                                            {
                                                where: { id: imageData.id },
                                                transaction: t,
                                            }
                                        );
                                    } else {
                                        await sectionImage.create(
                                            {
                                                src: imageData.src ?? null,
                                                alt: imageData.alt ?? null,
                                                caption: imageData.caption ?? null,
                                                sectionId: existingSection.id,
                                            },
                                            { transaction: t }
                                        );
                                    }
                                })
                            );
                        } else if (existingSection.sectionImage) {
                            await existingSection.sectionImage.destroy({ transaction: t });
                        }
                    }
                }
            }

            return await article.findByPk(articleId, {
                include: articleIncludeConfig,
                attributes: articleAttributes,
                transaction: t,
            });
        });

        return res.json(updatedArticle);
    } catch (err) {
        next(err);
    }
});

articleController.delete('/:id', isAuth, checkPermission('article', 'delete'), async (req, res, next) => {
    try {
        const articleId = parseInt(req.params.id);
        if (isNaN(articleId)) {
            throw new customError({
                message: 'Invalid article ID',
                statusCode: 400,
            });
        }

        const articleToDelete = await article.findByPk(articleId, {
            include: articleIncludeConfig,
        });

        if (!articleToDelete) {
            throw new customError({
                message: 'Article not found',
                statusCode: 404,
            });
        }

        const affectedArticles = await article.findAll({
            where: {
                [Op.or]: [{ nextArticleId: articleId }, { previousArticleId: articleId }, { relatedArticleId: articleId }],
            },
            include: articleIncludeConfig,
            attributes: articleAttributes,
        });

        await article.sequelize.transaction(async (t) => {
            if (articleToDelete.nextArticle && articleToDelete.previousArticle) {
                await articleToDelete.previousArticle.update(
                    {
                        nextArticleId: articleToDelete.nextArticle.id,
                    },
                    { transaction: t }
                );

                await articleToDelete.nextArticle.update(
                    {
                        previousArticleId: articleToDelete.previousArticle.id,
                    },
                    { transaction: t }
                );
            } else if (articleToDelete.nextArticle) {
                await articleToDelete.nextArticle.update(
                    {
                        previousArticleId: null,
                    },
                    { transaction: t }
                );
            } else if (articleToDelete.previousArticle) {
                await articleToDelete.previousArticle.update(
                    {
                        nextArticleId: null,
                    },
                    { transaction: t }
                );
            }

            await article.update(
                {
                    relatedArticleId: null,
                },
                {
                    where: { relatedArticleId: articleId },
                    transaction: t,
                }
            );

            await articleToDelete.destroy({ transaction: t });
        });

        return res.json({
            message: 'Article deleted successfully',
            affectedArticles: affectedArticles,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = articleController;
