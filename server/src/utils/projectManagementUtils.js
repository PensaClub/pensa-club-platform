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
        // Validate project data structure
        if (!projectData.slug) {
            throw new CustomError({
                message: 'Each project must have a slug',
                statusCode: 400,
                details: { projectData },
            });
        }

        // Check if we already processed this slug (duplicate prevention)
        if (processedSlugs.has(projectData.slug)) {
            throw new CustomError({
                message: `Duplicate project slug: ${projectData.slug}`,
                statusCode: 400,
                details: { slug: projectData.slug },
            });
        }
        processedSlugs.add(projectData.slug);

        // Try to find existing project by slug
        let existingProject = await findBySlugOrId(project, projectData.slug, { transaction });

        if (existingProject) {
            // Project exists - update it with the exact data
            console.log(`Updating existing project: ${projectData.slug}`);

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
            // Project doesn't exist - create it with the exact data
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

/**
 * Update initiative-project relationships
 * Removes missing projects and adds new ones
 */
const updateInitiativeProjectLinks = async (initiativeId, projectIds, transaction) => {
    // Access the junction table through any model's sequelize instance
    const { initiative } = require('../sequelize/models');

    // Remove all existing links
    await initiative.sequelize.models.initiative_projects.destroy({
        where: { initiative_id: initiativeId },
        transaction,
    });

    // Create new links if projects exist
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
