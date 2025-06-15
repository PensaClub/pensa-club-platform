const projectController = require('express').Router();

const { project, comment, user_account } = require('../sequelize/models');
const { getCommentConfig, transformComment } = require('../utils/commentUtils');
const { projectConfig, transformProject } = require('../utils/projectUtils');
const isAuth = require('../middlewares/isAuth');

projectController.get('/all', async (req, res, next) => {
    try {
        const projects = await project.findAll({
            include: projectConfig,
        });

        const projectsWithComments = await Promise.all(
            projects.map(async (project) => {
                const comments = await comment.findAll(getCommentConfig(project.id, 'project'));
                project.comments = comments.map((comment) => transformComment(comment));
                return transformProject(project);
            })
        );

        return res.status(200).json(projectsWithComments);
    } catch (err) {
        next(err);
    }
});

projectController.get('/single/:id', async (req, res, next) => {
    try {
        const projectId = req.params.id;

        const foundProject = await project.findByPk(projectId, {
            include: projectConfig,
        });

        if (!foundProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const comments = await comment.findAll(getCommentConfig(projectId, 'project'));
        foundProject.comments = comments.map((comment) => transformComment(comment));

        const transformedProject = transformProject(foundProject);

        return res.status(200).json(transformedProject);
    } catch (err) {
        next(err);
    }
});

projectController.get('/initiative/:initiativeId', async (req, res, next) => {
    try {
        const { initiativeId } = req.params;

        const projects = await project.findAll({
            where: {
                '$initiatives.id$': initiativeId,
            },
            include: projectConfig,
        });

        if (!projects || projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No projects found for this initiative',
            });
        }

        const transformedProjects = projects.map((project) => transformProject(project));

        return res.status(200).json(transformedProjects);
    } catch (err) {
        next(err);
    }
});

projectController.post('/:projectId/apply', isAuth, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { projectId } = req.params;

        if (!projectId || isNaN(Number(projectId))) {
            return res.status(400).json({ error: 'Invalid project ID' });
        }

        const existing = await project.findOne({
            where: { id: projectId },
            include: [
                {
                    model: user_account,
                    as: 'appliedBy',
                    where: { id: userId },
                    required: false,
                },
            ],
        });

        if (!existing) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (existing.appliedBy?.length > 0) {
            await existing.removeAppliedBy(userId);
            await existing.decrement('currentParticipants');
            return res.status(200).json({
                message: 'Application successfully removed.',
                applied: false,
            });
        }

        // If not applied, check if project is accepting applications
        if (existing.applicationStatus !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'This project is not currently accepting applications',
            });
        }

        // Check if application deadline has passed
        if (existing.applicationDeadline && new Date(existing.applicationDeadline) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Application deadline has passed',
            });
        }

        // Check if max participants reached
        if (existing.maxParticipants && existing.currentParticipants >= existing.maxParticipants) {
            return res.status(400).json({
                success: false,
                message: 'Maximum number of participants reached',
            });
        }

        // Add the application
        await existing.addAppliedBy(userId);
        await existing.increment('currentParticipants');
        return res.status(201).json({
            message: 'Application successfully submitted.',
            applied: true,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = projectController;
