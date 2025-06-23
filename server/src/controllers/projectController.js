const projectController = require('express').Router();
const { where, Op } = require('sequelize');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const {
    project,
    image,
    initiative,
    downloadMaterial,
    story,
    publication,
    contact,
    section,
    user_account,
    comment,
    sponsor,
    partner,
    milestone,
} = require('../sequelize/models');
const customError = require('../utils/customError');
const { transformProject, projectConfig } = require('../utils/projectUtils');
const { transformComment, getCommentConfig } = require('../utils/commentUtils');

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
        const param = req.params.id;
        let foundProject;
        if (isNaN(Number(param))) {
            foundProject = await project.findOne({ where: { slug: param } });
        } else {
            foundProject = await project.findByPk(Number(param));
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

projectController.get('/initiative/:initiativeId', async (req, res, next) => {
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

projectController.post('/:projectId/apply', isAuth, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { projectId } = req.params;
        let whereClause;

        if (isNaN(Number(projectId))) {
            whereClause = { slug: projectId };
        } else {
            whereClause = { id: Number(projectId) };
        }

        const existing = await project.findOne({
            where: whereClause,
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

projectController.post('/create', isAuth, async (req, res, next) => {
    try {
        const result = await project.sequelize.transaction(async (t) => {
            const newProject = await project.create(
                {
                    creatorId: req.user.userId,
                    ...req.body,
                },
                { transaction: t }
            );

            // Create main image if provided
            if (req.body.mainImage) {
                await image.create(
                    {
                        ...req.body.mainImage,
                        imageableId: newProject.id,
                        imageLinkConnection: 'project_main',
                    },
                    { transaction: t }
                );
            }

            // Create team contacts
            if (req.body.team?.length > 0) {
                await Promise.all(
                    req.body.team.map((contactData) =>
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
            if (req.body.contact) {
                await contact.create(
                    {
                        ...req.body.contact,
                        contactableId: newProject.id,
                        contactLinkConnection: 'project',
                        isTeamMember: false,
                    },
                    { transaction: t }
                );
            }

            // Create sections with their images
            if (req.body.sections?.length > 0) {
                await Promise.all(
                    req.body.sections.map(async (sectionData) => {
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
            if (req.body.sponsors?.length > 0) {
                await Promise.all(
                    req.body.sponsors.map(async (sponsorData) => {
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
            if (req.body.partners?.length > 0) {
                await Promise.all(
                    req.body.partners.map(async (partnerData) => {
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
            if (req.body.downloadMaterials?.length > 0) {
                await Promise.all(
                    req.body.downloadMaterials.map(async (materialData) => {
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
            if (req.body.milestones?.length > 0) {
                await Promise.all(
                    req.body.milestones.map((milestoneData) =>
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

projectController.patch('/:id', isAuth, async (req, res, next) => {
    try {
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

            if (Number(foundProject.creator.id) !== Number(req.user.userId)) {
                throw new customError({
                    message: 'Unauthorized to update this project',
                    statusCode: 403,
                });
            }

            await foundProject.update(req.body, { transaction: t });

            // Update main image if provided
            if (req.body.mainImage) {
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
                        ...req.body.mainImage,
                        imageableId: foundProject.id,
                        imageLinkConnection: 'project_main',
                    },
                    { transaction: t }
                );
            }

            // Update team contacts if provided
            if (req.body.team) {
                await contact.destroy({
                    where: {
                        contactableId: foundProject.id,
                        contactLinkConnection: 'project',
                        isTeamMember: true,
                    },
                    transaction: t,
                });
                if (req.body.team.length > 0) {
                    await Promise.all(
                        req.body.team.map((contactData) =>
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
            if (req.body.contact) {
                await contact.destroy({
                    where: {
                        contactableId: foundProject.id,
                        contactLinkConnection: 'project',
                        isTeamMember: false,
                    },
                    transaction: t,
                });
                await contact.create(
                    {
                        ...req.body.contact,
                        contactableId: foundProject.id,
                        contactLinkConnection: 'project',
                        isTeamMember: false,
                    },
                    { transaction: t }
                );
            }

            // Update sections if provided
            if (req.body.sections) {
                await section.destroy({
                    where: {
                        sectionableId: foundProject.id,
                        sectionLinkConnection: 'project',
                    },
                    transaction: t,
                });
                if (req.body.sections.length > 0) {
                    await Promise.all(
                        req.body.sections.map(async (sectionData) => {
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
            if (req.body.sponsors) {
                await sponsor.destroy({
                    where: {
                        sponsorableId: foundProject.id,
                        sponsorLinkConnection: 'project',
                    },
                    transaction: t,
                });
                if (req.body.sponsors.length > 0) {
                    await Promise.all(
                        req.body.sponsors.map(async (sponsorData) => {
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
            if (req.body.partners) {
                await partner.destroy({
                    where: {
                        partnerableId: foundProject.id,
                        partnerLinkConnection: 'project',
                    },
                    transaction: t,
                });
                if (req.body.partners.length > 0) {
                    await Promise.all(
                        req.body.partners.map(async (partnerData) => {
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
            if (req.body.downloadMaterials) {
                await downloadMaterial.destroy({
                    where: {
                        downloadableId: foundProject.id,
                        downloadLinkConnection: 'project',
                    },
                    transaction: t,
                });
                if (req.body.downloadMaterials.length > 0) {
                    await Promise.all(
                        req.body.downloadMaterials.map(async (materialData) => {
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
            if (req.body.milestones) {
                await milestone.destroy({
                    where: {
                        projectId: foundProject.id,
                    },
                    transaction: t,
                });
                if (req.body.milestones.length > 0) {
                    await Promise.all(
                        req.body.milestones.map((milestoneData) =>
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

projectController.delete('/:id', isAuth, async (req, res, next) => {
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

            if (Number(foundProject.creator.id) !== Number(req.user.userId)) {
                throw new customError({
                    message: 'Unauthorized to delete this project',
                    statusCode: 403,
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

module.exports = projectController;
