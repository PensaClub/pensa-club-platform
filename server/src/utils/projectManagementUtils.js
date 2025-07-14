const { project } = require('../sequelize/models');
const { findBySlugOrId } = require('./modelLookup');
const CustomError = require('./customError');

const manageInitiativeProjects = async (projectsData, initiativeId, userId, transaction) => {
    if (!projectsData || !Array.isArray(projectsData)) {
        return [];
    }

    const resolvedProjectIds = [];
    const processedSlugs = new Set();

    for (const projectData of projectsData) {
        if (!projectData.slug) {
            throw new CustomError({
                message: 'Each project must have a slug',
                statusCode: 400,
                details: { projectData },
            });
        }

        if (processedSlugs.has(projectData.slug)) {
            throw new CustomError({
                message: `Duplicate project slug: ${projectData.slug}`,
                statusCode: 400,
                details: { slug: projectData.slug },
            });
        }
        processedSlugs.add(projectData.slug);

        let existingProject = await findBySlugOrId(project, projectData.slug, { transaction });

        if (existingProject) {
            await existingProject.update(
                {
                    title: projectData.title,
                    shortDescription: projectData.description,
                    status: projectData.status,
                    location: projectData.coordinates
                        ? [
                              {
                                  coordinates: projectData.coordinates,
                              },
                          ]
                        : [],
                    logo: projectData.image,
                },
                { transaction }
            );

            resolvedProjectIds.push(existingProject.id);
        } else {
            console.log(`Creating new project: ${projectData.slug}`);

            const newProject = await project.create(
                {
                    creatorId: userId,
                    slug: projectData.slug,
                    title: projectData.title,
                    shortDescription: projectData.description,
                    status: projectData.status,
                    location: projectData.coordinates
                        ? [
                              {
                                  coordinates: projectData.coordinates,
                              },
                          ]
                        : [],
                    logo: projectData.image,
                    isDraft: false,
                },
                { transaction }
            );

            resolvedProjectIds.push(newProject.id);
        }
    }

    return resolvedProjectIds;
};

const updateInitiativeProjectLinks = async (initiativeId, projectIds, transaction) => {
    const { initiative } = require('../sequelize/models');

    await initiative.sequelize.models.initiative_projects.destroy({
        where: { initiative_id: initiativeId },
        transaction,
    });

    if (projectIds.length > 0) {
        const linkData = projectIds.map((projectId) => ({
            initiative_id: initiativeId,
            project_id: projectId,
        }));

        await initiative.sequelize.models.initiative_projects.bulkCreate(linkData, { transaction });
    }
};

module.exports = {
    manageInitiativeProjects,
    updateInitiativeProjectLinks,
};
