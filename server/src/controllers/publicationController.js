const publicationController = require('express').Router();
const { publication, initiative, section, image, comment } = require('../sequelize/models');

const publicationConfig = [
    {
        model: initiative,
        as: 'initiative',
        attributes: ['id', 'title', 'slug'],
    },
    {
        model: section,
        as: 'sections',
        include: [
            {
                model: image,
                as: 'image',
            },
        ],
    },
    {
        model: image,
        as: 'image',
    },
    {
        model: comment,
        as: 'comments',
    },
    {
        model: publication,
        as: 'relatedPublications',
        attributes: ['id', 'slug', 'title', 'shortDescription', 'image'],
    },
];

publicationController.get('/all', async (req, res, next) => {
    try {
        const publications = await publication.findAll({
            include: publicationConfig,
            order: [['publishedAt', 'DESC']],
        });

        return res.status(200).json({
            success: true,
            data: publications,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = publicationController;
