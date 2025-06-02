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

    if (transformedInitiative.mainImage) {
        const { imageableId, imageLinkConnection, ...imageData } = transformedInitiative.mainImage;
        transformedInitiative.mainImage = imageData;
    }

    return transformedInitiative;
};

module.exports = transformInitiative;
