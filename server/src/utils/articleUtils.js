const { Op } = require('sequelize');
const { article } = require('../sequelize/models');

async function updateArticleRelationships(articleInstance, relationships, transaction) {
    const { relatedArticleId, nextArticleId, previousArticleId } = relationships;

    const clearExistingConnections = async (fieldName, articleId) => {
        if (articleId !== undefined) {
            const articlesWithConnection = await article.findAll({
                where: {
                    [fieldName]: articleId,
                    id: { [Op.ne]: articleInstance.id },
                },
                transaction,
            });

            for (const connectedArticle of articlesWithConnection) {
                await connectedArticle.update({ [fieldName]: null }, { transaction });
            }
        }
    };

    await Promise.all([
        clearExistingConnections('relatedArticleId', relatedArticleId),
        clearExistingConnections('nextArticleId', nextArticleId),
        clearExistingConnections('previousArticleId', previousArticleId),
    ]);

    const updateFields = {};

    if (relatedArticleId !== undefined) {
        updateFields.relatedArticleId = relatedArticleId;
    }

    if (nextArticleId !== undefined) {
        updateFields.nextArticleId = nextArticleId;
    }

    if (previousArticleId !== undefined) {
        updateFields.previousArticleId = previousArticleId;
    }

    if (Object.keys(updateFields).length > 0) {
        await articleInstance.update(updateFields, { transaction });
    }
}

async function cleanupOldArticles() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    try {
        const result = await article.destroy({
            where: {
                createdAt: {
                    [Op.lt]: oneYearAgo,
                },
            },
        });

        return result;
    } catch (error) {
        throw error;
    }
}
const transformArticle = (article) => {
    const plainArticle = article.get({ plain: true });

    // Сортирай секциите по order поле
    if (plainArticle.sections && plainArticle.sections.length > 0) {
        plainArticle.sections = plainArticle.sections.sort((a, b) => a.order - b.order);
    }

    return plainArticle;
};

module.exports = {
    updateArticleRelationships,
    cleanupOldArticles,
    transformArticle,
};
