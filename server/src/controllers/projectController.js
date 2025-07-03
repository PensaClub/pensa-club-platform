const projectController = require('express').Router();
const { where, Op } = require('sequelize');
const isAuth = require('../middlewares/isAuth');
const { checkPermission } = require('../middlewares/rbac');
const { ProjectSchema, UpdateProjectSchema, ProjectApplicationSchema, PaginationQuerySchema } = require('../schemas/projects.schema');
const {
    project,
    image,
    downloadMaterial,
    contact,
    section,
    user_account,
    comment,
    sponsor,
    partner,
    milestone,
    project_application,
} = require('../sequelize/models');
const customError = require('../utils/customError');
const { transformProject, projectConfig } = require('../utils/projectUtils');
const { transformComment, getCommentConfig } = require('../utils/commentUtils');

// ========================================
// ENDPOINTS
// ========================================

projectController.get('/all', checkPermission('projects', 'read'), async (req, res, next) => {
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

projectController.get('/single/:id', checkPermission('projects', 'read'), async (req, res, next) => {
    try {
        const param = req.params.id;
        let foundProject;
        if (isNaN(Number(param))) {
            foundProject = await project.findOne({
                where: { slug: param },
                include: projectConfig,
            });
        } else {
            foundProject = await project.findByPk(Number(param), {
                include: projectConfig,
            });
        }

        if (!foundProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const comments = await comment.findAll(getCommentConfig(foundProject.id, 'project'));
        foundProject.comments = comments.map((comment) => transformComment(comment));

        const transformedProject = transformProject(foundProject);

        return res.status(200).json(transformedProject);
    } catch (err) {
        next(err);
    }
});

projectController.get('/initiative/:initiativeId', checkPermission('projects', 'read'), async (req, res, next) => {
    try {
        const param = req.params.initiativeId;
        let whereClause;
        if (isNaN(Number(param))) {
            whereClause = { '$initiatives.slug$': param };
        } else {
            whereClause = { '$initiatives.id$': Number(param) };
        }

        const projects = await project.findAll({
            where: whereClause,
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

projectController.post('/:projectId/apply', isAuth, checkPermission('projects', 'read'), async (req, res, next) => {
    try {
        // Validate application data
        const validatedData = ProjectApplicationSchema.parse(req.body);

        const userId = req.user.userId;
        const { projectId } = req.params;
        let whereClause;

        if (isNaN(Number(projectId))) {
            whereClause = { slug: projectId };
        } else {
            whereClause = { id: Number(projectId) };
        }

        const foundProject = await project.findOne({
            where: whereClause,
        });

        if (!foundProject) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user already applied
        const existingApplication = await project_application.findOne({
            where: {
                projectId: foundProject.id,
                userId: userId,
            },
        });

        if (existingApplication) {
            // Remove application
            await existingApplication.destroy();
            await foundProject.decrement('currentParticipants');
            return res.status(200).json({
                message: 'Application successfully removed.',
                applied: false,
            });
        }

        // If not applied, check if project is accepting applications
        if (foundProject.applicationStatus !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'This project is not currently accepting applications',
            });
        }

        // Check if application deadline has passed
        if (foundProject.applicationDeadline && new Date(foundProject.applicationDeadline) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Application deadline has passed',
            });
        }

        // Check if max participants reached
        if (foundProject.maxParticipants && foundProject.currentParticipants >= foundProject.maxParticipants) {
            return res.status(400).json({
                success: false,
                message: 'Maximum number of participants reached',
            });
        }

        // Create new application
        const applicationData = {
            projectId: foundProject.id,
            userId: userId,
            ...validatedData,
            appliedAt: new Date(),
        };

        await project_application.create(applicationData);
        await foundProject.increment('currentParticipants');

        return res.status(201).json({
            message: 'Application successfully submitted.',
            applied: true,
        });
    } catch (err) {
        next(err);
    }
});

projectController.post('/create', isAuth, checkPermission('projects', 'create'), async (req, res, next) => {
    try {
        // Validate project data
        const validatedData = ProjectSchema.parse(req.body);

        const result = await project.sequelize.transaction(async (t) => {
            const newProject = await project.create(
                {
                    creatorId: req.user.userId,
                    ...validatedData,
                },
                { transaction: t }
            );

            // Create main image if provided
            if (validatedData.mainImage) {
                await image.create(
                    {
                        ...validatedData.mainImage,
                        imageableId: newProject.id,
                        imageLinkConnection: 'project_main',
                    },
                    { transaction: t }
                );
            }

            // Create team contacts
            if (validatedData.team?.length > 0) {
                await Promise.all(
                    validatedData.team.map((contactData) =>
                        contact.create(
                            {
                                ...contactData,
                                contactableId: newProject.id,
                                contactLinkConnection: 'project',
                                isTeamMember: true,
                            },
                            { transaction: t }
                        )
                    )
                );
            }

            // Create main contact
            if (validatedData.contact) {
                await contact.create(
                    {
                        ...validatedData.contact,
                        contactableId: newProject.id,
                        contactLinkConnection: 'project',
                        isTeamMember: false,
                    },
                    { transaction: t }
                );
            }

            // Create sections with their images
            if (validatedData.sections?.length > 0) {
                await Promise.all(
                    validatedData.sections.map(async (sectionData) => {
                        const { images: sectionImages, ...sectionFields } = sectionData;
                        const createdSection = await section.create(
                            {
                                ...sectionFields,
                                sectionableId: newProject.id,
                                sectionLinkConnection: 'project',
                            },
                            { transaction: t }
                        );

                        if (sectionImages && Array.isArray(sectionImages)) {
                            await Promise.all(
                                sectionImages.map((imageData) =>
                                    image.create(
                                        {
                                            ...imageData,
                                            imageableId: createdSection.id,
                                            imageLinkConnection: 'section',
                                        },
                                        { transaction: t }
                                    )
                                )
                            );
                        }
                    })
                );
            }

            // Create sponsors
            if (validatedData.sponsors?.length > 0) {
                await Promise.all(
                    validatedData.sponsors.map(async (sponsorData) => {
                        const { id: sponsorId, ...sponsorFields } = sponsorData;
                        await sponsor.create(
                            {
                                ...sponsorFields,
                                sponsorableId: newProject.id,
                                sponsorLinkConnection: 'project',
                            },
                            { transaction: t }
                        );
                    })
                );
            }

            // Create partners
            if (validatedData.partners?.length > 0) {
                await Promise.all(
                    validatedData.partners.map(async (partnerData) => {
                        const { id: partnerId, ...partnerFields } = partnerData;
                        await partner.create(
                            {
                                ...partnerFields,
                                partnerableId: newProject.id,
                                partnerLinkConnection: 'project',
                            },
                            { transaction: t }
                        );
                    })
                );
            }

            // Create download materials
            if (validatedData.downloadMaterials?.length > 0) {
                await Promise.all(
                    validatedData.downloadMaterials.map(async (materialData) => {
                        const { image: materialImage, ...materialFields } = materialData;
                        const createdMaterial = await downloadMaterial.create(
                            {
                                ...materialFields,
                                downloadableId: newProject.id,
                                downloadLinkConnection: 'project',
                            },
                            { transaction: t }
                        );

                        if (materialImage) {
                            await image.create(
                                {
                                    ...materialImage,
                                    imageableId: createdMaterial.id,
                                    imageLinkConnection: 'downloadMaterial',
                                },
                                { transaction: t }
                            );
                        }
                    })
                );
            }

            // Create milestones
            if (validatedData.milestones?.length > 0) {
                await Promise.all(
                    validatedData.milestones.map((milestoneData) =>
                        milestone.create(
                            {
                                ...milestoneData,
                                projectId: newProject.id,
                            },
                            { transaction: t }
                        )
                    )
                );
            }

            const completeProject = await project.findByPk(newProject.id, {
                include: projectConfig,
                transaction: t,
            });
            return completeProject;
        });

        const transformedResponse = transformProject(result);
        return res.status(201).json(transformedResponse);
    } catch (err) {
        next(err);
    }
});

projectController.patch('/:id', isAuth, checkPermission('projects', 'update'), async (req, res, next) => {
    try {
        // Validate update data
        const validatedData = UpdateProjectSchema.parse(req.body);

        const param = req.params.id;
        const projectId = parseInt(param);

        const result = await project.sequelize.transaction(async (t) => {
            let foundProject;
            if (isNaN(projectId)) {
                foundProject = await project.findOne({
                    where: { slug: param },
                    include: [
                        ...projectConfig,
                        {
                            model: user_account,
                            as: 'creator',
                            attributes: ['id', 'email'],
                        },
                    ],
                    transaction: t,
                });
            } else {
                foundProject = await project.findByPk(projectId, {
                    include: [
                        ...projectConfig,
                        {
                            model: user_account,
                            as: 'creator',
                            attributes: ['id', 'email'],
                        },
                    ],
                    transaction: t,
                });
            }

            if (!foundProject) {
                throw new customError({
                    message: 'Project not found',
                    statusCode: 404,
                });
            }

            await foundProject.update(validatedData, { transaction: t });

            // Update main image if provided
            if (validatedData.mainImage) {
                // Delete existing main image
                await image.destroy({
                    where: {
                        imageableId: foundProject.id,
                        imageLinkConnection: 'project_main',
                    },
                    transaction: t,
                });

                // Create new main image
                await image.create(
                    {
                        ...validatedData.mainImage,
                        imageableId: foundProject.id,
                        imageLinkConnection: 'project_main',
                    },
                    { transaction: t }
                );
            }

            // Update team contacts if provided
            if (validatedData.team !== undefined) {
                await contact.destroy({
                    where: {
                        contactableId: foundProject.id,
                        contactLinkConnection: 'project',
                        isTeamMember: true,
                    },
                    transaction: t,
                });
                if (validatedData.team?.length > 0) {
                    await Promise.all(
                        validatedData.team.map((contactData) =>
                            contact.create(
                                {
                                    ...contactData,
                                    contactableId: foundProject.id,
                                    contactLinkConnection: 'project',
                                    isTeamMember: true,
                                },
                                { transaction: t }
                            )
                        )
                    );
                }
            }

            // Update main contact if provided
            if (validatedData.contact !== undefined) {
                await contact.destroy({
                    where: {
                        contactableId: foundProject.id,
                        contactLinkConnection: 'project',
                        isTeamMember: false,
                    },
                    transaction: t,
                });
                if (validatedData.contact) {
                    await contact.create(
                        {
                            ...validatedData.contact,
                            contactableId: foundProject.id,
                            contactLinkConnection: 'project',
                            isTeamMember: false,
                        },
                        { transaction: t }
                    );
                }
            }

            // Update sections if provided
            if (validatedData.sections !== undefined) {
                await section.destroy({
                    where: {
                        sectionableId: foundProject.id,
                        sectionLinkConnection: 'project',
                    },
                    transaction: t,
                });
                if (validatedData.sections?.length > 0) {
                    await Promise.all(
                        validatedData.sections.map(async (sectionData) => {
                            const { images: sectionImages, ...sectionFields } = sectionData;
                            const createdSection = await section.create(
                                {
                                    ...sectionFields,
                                    sectionableId: foundProject.id,
                                    sectionLinkConnection: 'project',
                                },
                                { transaction: t }
                            );

                            if (sectionImages && Array.isArray(sectionImages)) {
                                await Promise.all(
                                    sectionImages.map((imageData) =>
                                        image.create(
                                            {
                                                ...imageData,
                                                imageableId: createdSection.id,
                                                imageLinkConnection: 'section',
                                            },
                                            { transaction: t }
                                        )
                                    )
                                );
                            }
                        })
                    );
                }
            }

            // Update sponsors if provided
            if (validatedData.sponsors !== undefined) {
                await sponsor.destroy({
                    where: {
                        sponsorableId: foundProject.id,
                        sponsorLinkConnection: 'project',
                    },
                    transaction: t,
                });
                if (validatedData.sponsors?.length > 0) {
                    await Promise.all(
                        validatedData.sponsors.map(async (sponsorData) => {
                            const { id: sponsorId, ...sponsorFields } = sponsorData;
                            await sponsor.create(
                                {
                                    ...sponsorFields,
                                    sponsorableId: foundProject.id,
                                    sponsorLinkConnection: 'project',
                                },
                                { transaction: t }
                            );
                        })
                    );
                }
            }

            // Update partners if provided
            if (validatedData.partners !== undefined) {
                await partner.destroy({
                    where: {
                        partnerableId: foundProject.id,
                        partnerLinkConnection: 'project',
                    },
                    transaction: t,
                });
                if (validatedData.partners?.length > 0) {
                    await Promise.all(
                        validatedData.partners.map(async (partnerData) => {
                            const { id: partnerId, ...partnerFields } = partnerData;
                            await partner.create(
                                {
                                    ...partnerFields,
                                    partnerableId: foundProject.id,
                                    partnerLinkConnection: 'project',
                                },
                                { transaction: t }
                            );
                        })
                    );
                }
            }

            // Update download materials if provided
            if (validatedData.downloadMaterials !== undefined) {
                await downloadMaterial.destroy({
                    where: {
                        downloadableId: foundProject.id,
                        downloadLinkConnection: 'project',
                    },
                    transaction: t,
                });
                if (validatedData.downloadMaterials?.length > 0) {
                    await Promise.all(
                        validatedData.downloadMaterials.map(async (materialData) => {
                            const { image: materialImage, ...materialFields } = materialData;
                            const createdMaterial = await downloadMaterial.create(
                                {
                                    ...materialFields,
                                    downloadableId: foundProject.id,
                                    downloadLinkConnection: 'project',
                                },
                                { transaction: t }
                            );

                            if (materialImage) {
                                await image.create(
                                    {
                                        ...materialImage,
                                        imageableId: createdMaterial.id,
                                        imageLinkConnection: 'downloadMaterial',
                                    },
                                    { transaction: t }
                                );
                            }
                        })
                    );
                }
            }

            // Update milestones if provided
            if (validatedData.milestones !== undefined) {
                await milestone.destroy({
                    where: {
                        projectId: foundProject.id,
                    },
                    transaction: t,
                });
                if (validatedData.milestones?.length > 0) {
                    await Promise.all(
                        validatedData.milestones.map((milestoneData) =>
                            milestone.create(
                                {
                                    ...milestoneData,
                                    projectId: foundProject.id,
                                },
                                { transaction: t }
                            )
                        )
                    );
                }
            }

            const updatedProject = await project.findByPk(foundProject.id, {
                include: projectConfig,
                transaction: t,
            });

            return updatedProject;
        });

        const transformedResponse = transformProject(result);
        return res.status(200).json(transformedResponse);
    } catch (err) {
        next(err);
    }
});

projectController.delete('/:id', isAuth, checkPermission('projects', 'delete'), async (req, res, next) => {
    try {
        const param = req.params.id;
        const projectId = parseInt(param);

        await project.sequelize.transaction(async (t) => {
            let foundProject;
            if (isNaN(projectId)) {
                foundProject = await project.findOne({
                    where: { slug: param },
                    include: [
                        {
                            model: user_account,
                            as: 'creator',
                            attributes: ['id', 'email'],
                        },
                    ],
                    transaction: t,
                });
            } else {
                foundProject = await project.findByPk(projectId, {
                    include: [
                        {
                            model: user_account,
                            as: 'creator',
                            attributes: ['id', 'email'],
                        },
                    ],
                    transaction: t,
                });
            }

            if (!foundProject) {
                throw new customError({
                    message: 'Project not found',
                    statusCode: 404,
                });
            }

            // Delete all associated data
            await image.destroy({
                where: {
                    imageableId: foundProject.id,
                    imageLinkConnection: 'project_main',
                },
                transaction: t,
            });

            // Delete junction table entries for many-to-many relationships
            await project.sequelize.models.initiative_projects.destroy({
                where: { project_id: foundProject.id },
                transaction: t,
            });

            await project.sequelize.models.project_stories.destroy({
                where: { project_id: foundProject.id },
                transaction: t,
            });

            await project.sequelize.models.project_publications.destroy({
                where: { project_id: foundProject.id },
                transaction: t,
            });

            await project.sequelize.models.project_applications.destroy({
                where: { project_id: foundProject.id },
                transaction: t,
            });

            // Delete related records
            await downloadMaterial.destroy({
                where: {
                    downloadableId: foundProject.id,
                    downloadLinkConnection: 'project',
                },
                transaction: t,
            });

            await contact.destroy({
                where: {
                    contactableId: foundProject.id,
                    contactLinkConnection: 'project',
                },
                transaction: t,
            });

            await section.destroy({
                where: {
                    sectionableId: foundProject.id,
                    sectionLinkConnection: 'project',
                },
                transaction: t,
            });

            await comment.destroy({
                where: {
                    commentableId: foundProject.id,
                    commentsLinkConnection: 'project',
                },
                transaction: t,
            });

            await sponsor.destroy({
                where: {
                    sponsorableId: foundProject.id,
                    sponsorLinkConnection: 'project',
                },
                transaction: t,
            });

            await partner.destroy({
                where: {
                    partnerableId: foundProject.id,
                    partnerLinkConnection: 'project',
                },
                transaction: t,
            });

            await milestone.destroy({
                where: {
                    projectId: foundProject.id,
                },
                transaction: t,
            });

            // Finally, delete the project
            await foundProject.destroy({ transaction: t });
        });

        return res.status(200).json({
            message: 'Project and all associated data deleted successfully',
        });
    } catch (err) {
        next(err);
    }
});

projectController.get('/:projectId/applications', isAuth, checkPermission('projects', 'read'), async (req, res, next) => {
    try {
        const { projectId } = req.params;
        let whereClause;

        if (isNaN(Number(projectId))) {
            whereClause = { slug: projectId };
        } else {
            whereClause = { id: Number(projectId) };
        }

        const foundProject = await project.findOne({
            where: whereClause,
        });

        if (!foundProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if the current user is the project creator or has admin rights
        if (Number(foundProject.creatorId) !== Number(req.user.userId) && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Unauthorized to view project applications',
            });
        }

        // Get applications for this project
        const applications = await project_application.findAll({
            where: { projectId: foundProject.id },
            order: [['appliedAt', 'DESC']],
        });

        // Transform to match frontend expectations
        const transformedApplications = applications.map((app) => ({
            id: app.id,
            firstName: app.firstName,
            lastName: app.lastName,
            email: app.email,
            phone: app.phone,
            isAnonymous: app.isAnonymous,
            appliedAt: app.appliedAt,
            projectId: foundProject.slug,
        }));

        return res.status(200).json(transformedApplications);
    } catch (err) {
        next(err);
    }
});

projectController.post('/bookmark/:projectId', isAuth, checkPermission('projects', 'read'), async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const param = req.params.projectId;
        const projectId = parseInt(param);

        let existing;
        if (isNaN(projectId)) {
            existing = await project.findOne({
                where: { slug: param },
                include: [
                    {
                        model: user_account,
                        as: 'bookmarkedBy',
                        where: { id: userId },
                        required: false,
                    },
                ],
            });
        } else {
            existing = await project.findOne({
                where: { id: projectId },
                include: [
                    {
                        model: user_account,
                        as: 'bookmarkedBy',
                        where: { id: userId },
                        required: false,
                    },
                ],
            });
        }

        if (!existing) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (existing.bookmarkedBy?.length > 0) {
            await existing.removeBookmarkedBy(userId);
            return res.status(200).json({ message: 'Bookmark successfully removed.', bookmarked: false });
        } else {
            await existing.addBookmarkedBy(userId);
            return res.status(201).json({ message: 'Bookmark successfully added.', bookmarked: true });
        }
    } catch (err) {
        next(err);
    }
});

projectController.get('/user-projects/:email', checkPermission('projects', 'read'), async (req, res, next) => {
    try {
        const { email } = req.params;

        const user = await user_account.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const projects = await user.getBookmarkedProjects({
            include: projectConfig,
            order: [['id', 'ASC']],
            through: { attributes: [] },
        });

        if (projects.length === 0) {
            return res.status(200).json({
                message: 'No bookmarked projects found.',
                data: [],
            });
        }

        const projectsWithComments = await Promise.all(
            projects.map(async (project) => {
                const comments = await comment.findAll(getCommentConfig(project.id, 'project'));
                const transformed = await transformProject(project);
                transformed.comments = comments.map((comment) => transformComment(comment));
                return transformed;
            })
        );

        return res.status(200).json(projectsWithComments);
    } catch (err) {
        next(err);
    }
});

module.exports = projectController;
