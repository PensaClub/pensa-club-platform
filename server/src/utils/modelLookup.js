// modelLookup.js
module.exports.findBySlugOrId = async (Model, param, options = {}) => {
    let entity = null;
    if (typeof param === 'string' && isNaN(Number(param))) {
        entity = await Model.findOne({ where: { slug: param }, ...options });
    }
    if (!entity && !isNaN(Number(param))) {
        entity = await Model.findByPk(Number(param), options);
    }
    return entity;
};
