const applicationController = require('express').Router();
const { getAllApplications, getApplicationById } = require('../utils/applicationUtils');

applicationController.get('/all', async (req, res, next) => {
    try {
        const applications = await getAllApplications();
        return res.status(200).json(applications);
    } catch (err) {
        next(err);
    }
});

applicationController.get('/:applicationId', async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const application = await getApplicationById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        return res.status(200).json(application);
    } catch (err) {
        next(err);
    }
});

applicationController.patch('/:applicationId/status', async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        const application = await getApplicationById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        await application.update({ status });

        const updatedApplication = await getApplicationById(applicationId);
        return res.status(200).json(updatedApplication);
    } catch (err) {
        next(err);
    }
});

applicationController.delete('/:applicationId', async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const application = await getApplicationById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        await application.destroy();

        return res.status(200).json({
            message: 'Application deleted successfully',
        });
    } catch (err) {
        next(err);
    }
});

module.exports = applicationController;
