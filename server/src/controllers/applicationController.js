const applicationController = require('express').Router();
const { getAllApplications, getApplicationById } = require('../utils/applicationUtils');
const { sendProjectEmail } = require('../utils/zohoEmails');
const { project } = require('../sequelize/models');
const { frontend_base_url } = require('../config/envConfig');
const { checkPermission } = require('../middlewares/rbac');
const isAuth = require('../middlewares/isAuth');
const { UpdateApplicationSchema, SendEmailsSchema } = require('../schemas/applications.schema');

applicationController.get('/all', checkPermission('application', 'read'), async (req, res, next) => {
    try {
        const applications = await getAllApplications();
        return res.status(200).json(applications);
    } catch (err) {
        next(err);
    }
});

applicationController.get('/:applicationId', checkPermission('application', 'read'), async (req, res, next) => {
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

applicationController.patch('/:applicationId/status', isAuth, checkPermission('application', 'update'), async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { status } = UpdateApplicationSchema.parse({ status: req.body.status });
        const userId = req.user.userId;
        const userRole = req.user.role;

        const application = await getApplicationById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (userRole !== 'admin' && userRole !== 'moderator' && application.userId !== userId) {
            return res.status(403).json({ message: 'Access denied - you can only modify your own applications' });
        }

        await application.update({ status });

        const updatedApplication = await getApplicationById(applicationId);
        return res.status(200).json(updatedApplication);
    } catch (err) {
        next(err);
    }
});

applicationController.delete('/:applicationId', isAuth, checkPermission('application', 'delete'), async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const application = await getApplicationById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (userRole !== 'admin' && userRole !== 'moderator' && application.userId !== userId) {
            return res.status(403).json({ message: 'Access denied - you can only delete your own applications' });
        }

        await application.destroy();

        return res.status(200).json({
            message: 'Application deleted successfully',
        });
    } catch (err) {
        next(err);
    }
});

applicationController.post('/send-personalized-emails', isAuth, checkPermission('application', 'sendEmails'), async (req, res, next) => {
    try {
        const { emails } = SendEmailsSchema.parse(req.body);

        if (!Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ success: false, message: 'No emails provided.' });
        }

        const results = [];
        let sentCount = 0;

        for (const recipient of emails) {
            try {
                let projectData = null;
                let projectId = null;

                if (recipient.applicationId) {
                    const application = await getApplicationById(recipient.applicationId);
                    if (application && application.projectId) {
                        projectId = application.projectId;

                        let foundProject = await project.findByPk(projectId);
                        if (foundProject) {
                            let locationAddress = '';
                            if (Array.isArray(foundProject.location) && foundProject.location.length > 0) {
                                locationAddress = foundProject.location[0].address || '';
                            }

                            projectData = {
                                title: foundProject.title,
                                description: foundProject.shortDescription || foundProject.fullDescription || '',
                                category: foundProject.category,
                                applicationDeadline: foundProject.applicationDeadline,
                                currentParticipants: foundProject.currentParticipants,
                                maxParticipants: foundProject.maxParticipants,
                                status: foundProject.status,
                                location: locationAddress,
                                link: `${frontend_base_url}/projects/${foundProject.slug}`,
                            };
                        }
                    }
                }

                await sendProjectEmail({
                    to: recipient.email,
                    subject: recipient.subject,
                    message: recipient.message,
                    ...projectData,
                });

                results.push({
                    applicationId: recipient.applicationId,
                    email: recipient.email,
                    projectId: projectId,
                    sent: true,
                    error: null,
                    updateStatus: recipient.updateStatus || null,
                });
                sentCount++;
            } catch (err) {
                results.push({
                    applicationId: recipient.applicationId,
                    email: recipient.email,
                    projectId: null,
                    sent: false,
                    error: err.message,
                    updateStatus: recipient.updateStatus || null,
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: `Successfully sent ${sentCount} out of ${emails.length} emails`,
            results,
            summary: {
                totalRequested: emails.length,
                successfullySent: sentCount,
                failed: emails.length - sentCount,
            },
        });
    } catch (err) {
        next(err);
    }
});

module.exports = applicationController;
