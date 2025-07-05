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

const getApplicationsByProjectId = async (projectId) => {
    return await project_application.findAll({
        ...applicationsConfig,
        where: { projectId },
        order: [['appliedAt', 'DESC']],
    });
};

module.exports = {
    getAllApplications,
    getApplicationById,
    getApplicationsByProjectId,
};
