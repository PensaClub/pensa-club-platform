const { project_application } = require('../sequelize/models');

const applicationsConfig = {
    attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'isAnonymous', 'status', 'appliedAt', 'projectId'],
};

const getAllApplications = async () => {
    return await project_application.findAll({
        ...applicationsConfig,
        order: [['appliedAt', 'DESC']],
    });
};

const getApplicationById = async (applicationId) => {
    return await project_application.findByPk(applicationId, applicationsConfig);
};

module.exports = {
    getAllApplications,
    getApplicationById,
};
