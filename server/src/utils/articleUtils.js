const { Op } = require('sequelize');

async function updateArticleRelationships(articleInstance, ArticleModel, relationships, transaction) {
    const { relatedArticleId, nextArticleId, previousArticleId } = relationships;

    const clearExistingConnections = async (fieldName, articleId) => {
        if (articleId !== undefined) {
            const articlesWithConnection = await ArticleModel.findAll({
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

module.exports = {
    updateArticleRelationships,
};
