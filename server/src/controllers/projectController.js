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
const CustomError = require('../utils/customError');
const { transformProject, projectConfig } = require('../utils/projectUtils');
const { transformComment, getCommentConfig } = require('../utils/commentUtils');

// ========================================
// ENDPOINTS
// ========================================

projectController.post('/create', isAuth, checkPermission('projects', 'create'), async (req, res, next) => {
    try {
        const validatedData = ProjectSchema.parse(req.body);
        const projectData = { ...validatedData, isDraft: false };
        return createProject(projectData, req, res, next);
    } catch (err) {
        next(err);
    }
});

projectController.post('/draft/save/:id?', isAuth, checkPermission('projects', 'draft', 'create'), async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            const validatedData = ProjectSchema.parse(req.body);
            const projectData = { ...validatedData, isDraft: true };
            return createProject(projectData, req, res, next);
        }

        const validatedData = UpdateProjectSchema.parse(req.body);
        return updateProject(validatedData, req, res, next, true);
    } catch (err) {
        next(err);
    }
});

projectController.get('/draft/:id', isAuth, checkPermission('projects', 'draft', 'read'), async (req, res, next) => {
    return getSingleProjectByDraftStatus(true, req, res, next);
});

projectController.get('/single/:id', checkPermission('projects', 'read'), async (req, res, next) => {
    return getSingleProjectByDraftStatus(false, req, res, next);
});

projectController.get('/drafts', isAuth, checkPermission('projects', 'draft', 'read'), async (req, res, next) => {
    return getProjectsByDraftStatus(true, req, res, next);
});

projectController.get('/all', checkPermission('projects', 'read'), async (req, res, next) => {
    return getProjectsByDraftStatus(false, req, res, next);
});

projectController.delete('/draft/:id', isAuth, checkPermission('projects', 'draft', 'delete'), async (req, res, next) => {
    return deleteProjectByDraftStatus(true, req, res, next);
});

projectController.delete('/:id', isAuth, checkPermission('projects', 'delete'), async (req, res, next) => {
    return deleteProjectByDraftStatus(false, req, res, next);
});

projectController.put('/:id', isAuth, checkPermission('projects', 'update'), async (req, res, next) => {
    try {
        const validatedData = UpdateProjectSchema.parse(req.body);
        return updateProject(validatedData, req, res, next, false);
    } catch (err) {
        next(err);
    }
});

projectController.patch('/toggle-draft/:id', isAuth, checkPermission('projects', 'update'), async (req, res, next) => {
    try {
        const param = req.params.id;
        const projectId = parseInt(param);

        const result = await project.sequelize.transaction(async (t) => {
            let foundProject;

            foundProject = await project.findOne({
                where: { slug: param },
                transaction: t,
            });

            if (!foundProject && !isNaN(projectId)) {
                foundProject = await project.findByPk(projectId, {
                    transaction: t,
                });
            }

            if (!foundProject) {
                throw new CustomError({
                    message: 'Project not found',
                    statusCode: 404,
                });
            }

            const wasDraft = foundProject.isDraft;
            await foundProject.update({ isDraft: !foundProject.isDraft }, { transaction: t });

            return {
                slug: foundProject.slug,
                wasDraft: wasDraft,
                isNowDraft: !wasDraft,
            };
        });

        const statusMessage = result.wasDraft
            ? `Project with slug '${result.slug}' has been changed from draft to published.`
            : `Project with slug '${result.slug}' has been changed from published to draft.`;

        return res.status(200).json({
            message: statusMessage,
        });
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
            where: { ...whereClause, isDraft: false },
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
            whereClause = { slug: projectId, isDraft: false };
        } else {
            whereClause = { id: Number(projectId), isDraft: false };
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

projectController.post('/bookmark/:projectId', isAuth, checkPermission('projects', 'read'), async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const param = req.params.projectId;
        const projectId = parseInt(param);

        let existing;
        if (isNaN(projectId)) {
            existing = await project.findOne({
                where: { slug: param, isDraft: false },
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
                where: { id: projectId, isDraft: false },
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
            where: { isDraft: false },
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

// ========================================
// FUNCTIONS
// ========================================

const getSingleProjectByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const param = req.params.id;
        const projectId = parseInt(param);

        let foundProject;

        foundProject = await project.findOne({
            where: {
                slug: param,
                isDraft: isDraft,
            },
            include: projectConfig,
        });

        if (!foundProject && !isNaN(projectId)) {
            foundProject = await project.findOne({
                where: {
                    id: projectId,
                    isDraft: isDraft,
                },
                include: projectConfig,
            });
        }

        if (!foundProject) {
            throw new CustomError({
                message: `Project not found${isDraft ? ' or not a draft' : ''}`,
                statusCode: 404,
            });
        }

        const comments = await comment.findAll(getCommentConfig(foundProject.id, 'project'));
        foundProject.comments = comments.map((comment) => transformComment(comment));

        const transformed = transformProject(foundProject);

        return res.status(200).json(transformed);
    } catch (err) {
        next(err);
    }
};

const deleteProjectByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const param = req.params.id;
        const projectId = parseInt(param);

        await project.sequelize.transaction(async (t) => {
            let foundProject;
            if (isNaN(projectId)) {
                foundProject = await project.findOne({
                    where: {
                        slug: param,
                        isDraft: isDraft,
                    },
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
                    where: { isDraft: isDraft },
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
                throw new CustomError({
                    message: `Project not found${isDraft ? ' or not a draft' : ''}`,
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

            await project.sequelize.models.project_bookmarks.destroy({
                where: { project_id: foundProject.id },
                transaction: t,
            });

            await project_application.destroy({
                where: { projectId: foundProject.id },
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
            message: `${isDraft ? 'Draft ' : ''}Project deleted successfully`,
        });
    } catch (err) {
        next(err);
    }
};

const getProjectsByDraftStatus = async (isDraft, req, res, next) => {
    try {
        const { page, limit } = PaginationQuerySchema.parse(req.query);

        const totalCount = await project.count({
            distinct: true,
            where: {
                isDraft: isDraft,
            },
        });

        const totalPages = Math.ceil(totalCount / limit);

        if (totalCount === 0) {
            return res.status(200).json({
                data: [],
                pagination: {
                    page: 1,
                    limit: limit,
                    totalProjects: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            });
        }

        const actualPage = Math.min(page, totalPages);
        const offset = (actualPage - 1) * limit;

        const projects = await project.findAll({
            where: {
                isDraft: isDraft,
            },
            include: projectConfig,
            limit: limit,
            offset: offset,
            order: [['id', 'ASC']],
        });

        const transformedList = await Promise.all(
            projects.map(async (project) => {
                const comments = await comment.findAll(getCommentConfig(project.id, 'project'));
                const transformed = transformProject(project);
                transformed.comments = comments.map((comment) => transformComment(comment));
                return transformed;
            })
        );

        return res.status(200).json({
            data: transformedList,
            pagination: {
                page: actualPage,
                limit: limit,
                totalProjects: totalCount,
                totalPages,
                hasNextPage: actualPage < totalPages,
                hasPrevPage: actualPage > 1,
            },
        });
    } catch (err) {
        next(err);
    }
};

const createProject = async (projectData, req, res, next) => {
    try {
        const result = await project.sequelize.transaction(async (t) => {
            const newProject = await project.create(
                {
                    creatorId: req.user.userId,
                    ...projectData,
                },
                { transaction: t }
            );

            // Create main image if provided
            if (projectData.mainImage) {
                await image.create(
                    {
                        ...projectData.mainImage,
                        imageableId: newProject.id,
                        imageLinkConnection: 'project_main',
                    },
                    { transaction: t }
                );
            }

            // Create team contacts
            if (projectData.team?.length > 0) {
                await Promise.all(
                    projectData.team.map((contactData) =>
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
            if (projectData.contact) {
                await contact.create(
                    {
                        ...projectData.contact,
                        contactableId: newProject.id,
                        contactLinkConnection: 'project',
                        isTeamMember: false,
                    },
                    { transaction: t }
                );
            }

            // Create sections with their images
            if (projectData.sections?.length > 0) {
                await Promise.all(
                    projectData.sections.map(async (sectionData) => {
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
            if (projectData.sponsors?.length > 0) {
                await Promise.all(
                    projectData.sponsors.map(async (sponsorData) => {
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
            if (projectData.partners?.length > 0) {
                await Promise.all(
                    projectData.partners.map(async (partnerData) => {
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
            if (projectData.downloadMaterials?.length > 0) {
                await Promise.all(
                    projectData.downloadMaterials.map(async (materialData) => {
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
            if (projectData.milestones?.length > 0) {
                await Promise.all(
                    projectData.milestones.map((milestoneData) =>
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
};

const updateProject = async (projectData, req, res, next, isDraft = false) => {
    try {
        const param = req.params.id;
        const projectId = parseInt(param);

        const result = await project.sequelize.transaction(async (t) => {
            let foundProject;

            foundProject = await project.findOne({
                where: {
                    slug: param,
                    isDraft: isDraft,
                },
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

            if (!foundProject && !isNaN(projectId)) {
                foundProject = await project.findByPk(projectId, {
                    where: { isDraft: isDraft },
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
                throw new CustomError({
                    message: `Project not found${isDraft ? ' or not a draft' : ''}`,
                    statusCode: 404,
                });
            }

            await foundProject.update({ ...projectData, isDraft: isDraft }, { transaction: t });

            // Update main image if provided
            if (projectData.mainImage) {
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
                        ...projectData.mainImage,
                        imageableId: foundProject.id,
                        imageLinkConnection: 'project_main',
                    },
                    { transaction: t }
                );
            }

            // Update team contacts if provided
            if (projectData.team !== undefined) {
                await contact.destroy({
                    where: {
                        contactableId: foundProject.id,
                        contactLinkConnection: 'project',
                        isTeamMember: true,
                    },
                    transaction: t,
                });
                if (projectData.team?.length > 0) {
                    await Promise.all(
                        projectData.team.map((contactData) =>
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
            if (projectData.contact !== undefined) {
                await contact.destroy({
                    where: {
                        contactableId: foundProject.id,
                        contactLinkConnection: 'project',
                        isTeamMember: false,
                    },
                    transaction: t,
                });
                if (projectData.contact) {
                    await contact.create(
                        {
                            ...projectData.contact,
                            contactableId: foundProject.id,
                            contactLinkConnection: 'project',
                            isTeamMember: false,
                        },
                        { transaction: t }
                    );
                }
            }

            // Update sections if provided
            if (projectData.sections !== undefined) {
                await section.destroy({
                    where: {
                        sectionableId: foundProject.id,
                        sectionLinkConnection: 'project',
                    },
                    transaction: t,
                });
                if (projectData.sections?.length > 0) {
                    await Promise.all(
                        projectData.sections.map(async (sectionData) => {
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
            if (projectData.sponsors !== undefined) {
                await sponsor.destroy({
                    where: {
                        sponsorableId: foundProject.id,
                        sponsorLinkConnection: 'project',
                    },
                    transaction: t,
                });
                if (projectData.sponsors?.length > 0) {
                    await Promise.all(
                        projectData.sponsors.map(async (sponsorData) => {
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
            if (projectData.partners !== undefined) {
                await partner.destroy({
                    where: {
                        partnerableId: foundProject.id,
                        partnerLinkConnection: 'project',
                    },
                    transaction: t,
                });
                if (projectData.partners?.length > 0) {
                    await Promise.all(
                        projectData.partners.map(async (partnerData) => {
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
            if (projectData.downloadMaterials !== undefined) {
                await downloadMaterial.destroy({
                    where: {
                        downloadableId: foundProject.id,
                        downloadLinkConnection: 'project',
                    },
                    transaction: t,
                });
                if (projectData.downloadMaterials?.length > 0) {
                    await Promise.all(
                        projectData.downloadMaterials.map(async (materialData) => {
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
            if (projectData.milestones !== undefined) {
                await milestone.destroy({
                    where: {
                        projectId: foundProject.id,
                    },
                    transaction: t,
                });
                if (projectData.milestones?.length > 0) {
                    await Promise.all(
                        projectData.milestones.map((milestoneData) =>
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
};

module.exports = projectController;
