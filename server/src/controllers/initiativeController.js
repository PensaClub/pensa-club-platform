const initiativeController = require('express').Router();
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const { initiative, image, project, downloadMaterial, publishedContent, contact, section } = require('../sequelize/models');
const customError = require('../utils/customError');
const transformInitiative = require('../utils/initiativeUtils');

const initiativeConfig = [
    {
        model: image,
        as: 'mainImage',
        where: { imageLinkConnection: 'initiative' },
        required: false,
    },
    {
        model: project,
        as: 'projects',
        attributes: ['id', 'title-slug', 'title', 'description', 'status', 'image', 'link', 'lat', 'lng'],
    },
    {
        model: downloadMaterial,
        as: 'downloadMaterials',
        attributes: ['id', 'title-slug', 'title', 'description', 'fileType', 'fileSize', 'downloadUrl'],
        include: [
            {
                model: image,
                as: 'image',
                attributes: ['id', 'src', 'alt'],
                where: { imageLinkConnection: 'downloadMaterial' },
                required: false,
            },
        ],
    },
    {
        model: publishedContent,
        as: 'stories',
        where: { type: 'story' },
        attributes: ['id', 'title-slug', 'title', 'description', 'link', 'publishedAt', 'author'],
        include: [
            {
                model: image,
                as: 'image',
                attributes: ['id', 'src', 'alt'],
                where: { imageLinkConnection: 'publishedContent' },
                required: false,
            },
        ],
    },
    {
        model: publishedContent,
        as: 'publications',
        where: { type: 'publication' },
        attributes: ['id', 'title-slug', 'title', 'description', 'link', 'publishedAt'],
        include: [
            {
                model: image,
                as: 'image',
                attributes: ['id', 'src', 'alt'],
                where: { imageLinkConnection: 'publishedContent' },
                required: false,
            },
        ],
    },
    {
        model: contact,
        as: 'contact',
        where: { isMainContact: true },
        attributes: ['id', 'name', 'position', 'email', 'phone', 'image'],
    },
    {
        model: contact,
        as: 'additionalContacts',
        where: { isMainContact: false },
        attributes: ['id', 'name', 'email', 'phone'],
    },
    {
        model: section,
        as: 'sections',
        where: { sectionLinkConnection: 'initiative' },
        attributes: ['id', 'title-slug', 'title', 'content', 'order'],
        include: [
            {
                model: image,
                as: 'sectionImages',
                attributes: ['id', 'src', 'alt'],
                where: { imageLinkConnection: 'section' },
                required: false,
            },
        ],
    },
];

const initiativeAttributes = ['id', 'slug', 'title', 'shortDescription', 'category', 'address', 'lat', 'lng', 'status', 'campaignStatus', 'commentsEnabled'];

initiativeController.get('/all', async (req, res, next) => {
    try {
        const initiatives = await initiative.findAll({
            include: initiativeConfig,
            attributes: initiativeAttributes,
        });
        const transformedInitiatives = initiatives.map(transformInitiative);
        return res.status(200).json(transformedInitiatives);
    } catch (err) {
        next(err);
    }
});

initiativeController.get('/single/:id', async (req, res, next) => {
    try {
        const initiativeId = parseInt(req.params.id);

        if (isNaN(initiativeId)) {
            throw new customError({
                message: 'Invalid initiative ID',
                statusCode: 400,
            });
        }

        const foundInitiative = await initiative.findByPk(initiativeId, {
            include: initiativeConfig,
            attributes: initiativeAttributes,
        });

        if (!foundInitiative) {
            throw new customError({
                message: 'Initiative not found',
                statusCode: 404,
            });
        }

        const transformedInitiative = transformInitiative(foundInitiative);
        return res.status(200).json(transformedInitiative);
    } catch (err) {
        next(err);
    }
});

module.exports = initiativeController;
