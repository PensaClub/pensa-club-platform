const { initiative, section, image, comment, publication } = require('../sequelize/models');

const publicationConfig = [
    {
        model: initiative,
        as: 'initiatives',
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

module.exports = {
    publicationConfig,
};
