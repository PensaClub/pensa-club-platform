const publicationController = require('express').Router();
const { publication, section, image } = require('../sequelize/models');
const { publicationConfig, transformPublication } = require('../utils/publicationUtils');

publicationController.post('/create', async (req, res, next) => {
    try {
        const { sections, image: mainImage, relatedPublications, ...pubData } = req.body;

        const result = await publication.sequelize.transaction(async (t) => {
            // 1. Create the publication
            const newPub = await publication.create(pubData, { transaction: t });

            // 2. Sections
            if (sections && sections.length > 0) {
                for (const sectionData of sections) {
                    const { images: sectionImages, ...sectionFields } = sectionData;
                    const createdSection = await section.create(
                        {
                            ...sectionFields,
                            sectionableId: newPub.id,
                            sectionLinkConnection: 'publication',
                        },
                        { transaction: t }
                    );
                    // Section images
                    if (sectionImages && Array.isArray(sectionImages)) {
                        for (const img of sectionImages) {
                            await image.create(
                                {
                                    ...img,
                                    imageableId: createdSection.id,
                                    imageLinkConnection: 'section',
                                },
                                { transaction: t }
                            );
                        }
                    }
                }
            }

            // 3. Main image
            if (mainImage) {
                await image.create(
                    {
                        ...mainImage,
                        imageableId: newPub.id,
                        imageLinkConnection: 'publication',
                    },
                    { transaction: t }
                );
            }

            // 4. Related Publications
            if (relatedPublications && relatedPublications.length > 0) {
                await newPub.setRelatedPublications(relatedPublications, { transaction: t });
            }

            // Return the full publication with all associations
            return await publication.findByPk(newPub.id, {
                include: publicationConfig,
                transaction: t,
            });
        });

        const transformed = await transformPublication(result);
        return res.status(201).json(transformed);
    } catch (err) {
        next(err);
    }
});

// GET SINGLE (by id or slug)
publicationController.get('/single/:param', async (req, res, next) => {
    try {
        const { param } = req.params;
        let pub = await publication.findOne({
            where: { slug: param },
            include: publicationConfig,
        });
        if (!pub && !isNaN(Number(param))) {
            pub = await publication.findByPk(Number(param), { include: publicationConfig });
        }
        if (!pub) return res.status(404).json({ success: false, message: 'Publication not found' });
        return res.status(200).json({ success: true, data: pub });
    } catch (err) {
        next(err);
    }
});

// UPDATE
publicationController.put('/:idOrSlug', async (req, res, next) => {
    try {
        const { idOrSlug } = req.params;
        const pub = await publication.findOne({
            where: {
                [sequelize.Op.or]: [{ id: isNaN(Number(idOrSlug)) ? undefined : Number(idOrSlug) }, { slug: idOrSlug }],
            },
        });
        if (!pub) return res.status(404).json({ success: false, message: 'Publication not found' });
        await pub.update(req.body);
        return res.status(200).json({ success: true, data: pub });
    } catch (err) {
        next(err);
    }
});

// DELETE
publicationController.delete('/:idOrSlug', async (req, res, next) => {
    try {
        const { idOrSlug } = req.params;
        const pub = await publication.findOne({
            where: {
                [sequelize.Op.or]: [{ id: isNaN(Number(idOrSlug)) ? undefined : Number(idOrSlug) }, { slug: idOrSlug }],
            },
        });
        if (!pub) return res.status(404).json({ success: false, message: 'Publication not found' });
        await pub.destroy();
        return res.status(200).json({ success: true, message: 'Publication deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = publicationController;
