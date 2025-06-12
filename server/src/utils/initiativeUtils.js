const transformInitiative = (initiative) => {
    const plainInitiative = initiative.get({ plain: true });

    // Transform location data
    const { address, lat, lng, initiativeBookmarks, ...initiativeData } = plainInitiative;
    const transformedInitiative = {
        ...initiativeData,
        location: {
            address,
            coordinates: {
                lat,
                lng,
            },
        },
    };

    // Transform sections
    if (transformedInitiative.sections) {
        transformedInitiative.sections = transformedInitiative.sections.map((section) => {
            if (section.sectionImages) {
                const { sectionImages, ...singleSection } = section;
                return {
                    ...singleSection,
                    image: sectionImages,
                };
            }
            return section;
        });
    }

    if (transformedInitiative.projects) {
        transformedInitiative.projects = transformedInitiative.projects.map((project) => {
            const { lat, lng, ...restOfProject } = project;
            return {
                ...restOfProject,
                coordinates: {
                    lat,
                    lng,
                },
            };
        });
    }

    return transformedInitiative;
};

module.exports = transformInitiative;

// To be used later

// function transformLocationFields(obj, addressKey = 'address', latKey = 'lat', lngKey = 'lng') {
//     const { [addressKey]: address, [latKey]: lat, [lngKey]: lng, ...rest } = obj;
//     return {
//         ...rest,
//         location: {
//             address,
//             coordinates: { lat, lng }
//         }
//     };
// }
// module.exports = transformLocationFields;
