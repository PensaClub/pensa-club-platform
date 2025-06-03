const transformInitiative = (initiative) => {
    const plainInitiative = initiative.get({ plain: true });

    // Transform location data
    const { address, lat, lng, ...initiativeData } = plainInitiative;
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

    return transformedInitiative;
};

module.exports = transformInitiative;
