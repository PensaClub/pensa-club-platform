// modelLookup.js
module.exports.findBySlugOrId = async (Model, param, options = {}) => {
    let where = {};
    if (!isNaN(Number(param))) {
        where.id = Number(param);
    } else {
        where.slug = param;
    }
    where = { ...where, ...(options.where || {}) };
    return Model.findOne({ ...options, where });
};
