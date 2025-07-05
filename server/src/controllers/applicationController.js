const applicationController = require('express').Router();
const { getAllApplications, getApplicationById, getApplicationsByProjectId } = require('../utils/applicationUtils');
const { sendProjectEmail } = require('../utils/zohoEmails');
const { project } = require('../sequelize/models');
const { frontend_base_url } = require('../config/envConfig');

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

applicationController.post('/project/:projectId/send-mass-email', async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({
                message: 'Subject and message are required',
            });
        }

        let foundProject = await project.findOne({ where: { slug: projectId } });

        if (!foundProject && !isNaN(projectId)) {
            foundProject = await project.findByPk(projectId);
        }

        if (!foundProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const projectLink = `${frontend_base_url}/projects/${foundProject.slug}`;

        const applications = await getApplicationsByProjectId(projectId);

        if (applications.length === 0) {
            return res.status(404).json({
                message: 'No applications found for this project',
            });
        }

        const emailAddresses = applications.filter((app) => app.email && !app.isAnonymous).map((app) => app.email);

        if (emailAddresses.length === 0) {
            return res.status(400).json({
                message: 'No valid email addresses found among applications',
            });
        }

        await sendProjectEmail({
            projectTitle: foundProject.title,
            projectDescription: foundProject.shortDescription || foundProject.fullDescription || '',
            projectLink,
            subject,
            message,
            toAddresses: emailAddresses,
        });

        return res.status(200).json({
            message: `Mass email sent successfully to ${emailAddresses.length} applicants`,
            sentTo: emailAddresses.length,
            totalApplications: applications.length,
        });
    } catch (err) {
        next(err);
    }
});

applicationController.post('/send-personalized-emails', async (req, res, next) => {
    try {
        const { recipients = [], metadata = {} } = req.body;
        if (!Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ success: false, message: 'No recipients provided.' });
        }

        const results = [];
        let sentCount = 0;

        for (const recipient of recipients) {
            try {
                // Always fetch the application by applicationId
                let projectData = null;
                let projectLink = null;
                let projectId = null;

                if (recipient.applicationId) {
                    const application = await getApplicationById(recipient.applicationId);
                    if (application && application.projectId) {
                        projectId = application.projectId;

                        // Fetch the project by ID
                        let foundProject = await project.findByPk(projectId);
                        if (foundProject) {
                            projectData = {
                                title: foundProject.title,
                                description: foundProject.shortDescription || foundProject.fullDescription || '',
                            };
                            projectLink = `${frontend_base_url}/projects/${foundProject.slug}`;
                        }
                    }
                }

                // Send email using the new sendProjectEmail function
                await sendProjectEmail({
                    to: recipient.email,
                    subject: recipient.subject,
                    message: recipient.message,
                    projectTitle: projectData?.title,
                    projectDescription: projectData?.description,
                    projectLink: projectLink,
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
            message: `Successfully sent ${sentCount} out of ${recipients.length} emails`,
            results,
            summary: {
                totalRequested: recipients.length,
                successfullySent: sentCount,
                failed: recipients.length - sentCount,
            },
        });
    } catch (err) {
        next(err);
    }
});

module.exports = applicationController;
