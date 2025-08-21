const { z } = require('zod');
const { optionalString, optionalNumber, optionalEnum } = require('./helpers');

const locationSchema = z.object({
    id: z.string().optional(),
    clubId: z.string().optional(),

    address: optionalString(),
    city: optionalString(),
    municipality: optionalString(),
    region: optionalString(),
    postalCode: optionalString(),

    coordinates: z
        .object({
            lat: optionalNumber(-90, 90),
            lng: optionalNumber(-180, 180),
        })
        .optional(),

    venue: z
        .object({
            type: optionalEnum(['municipal', 'rented', 'owned', 'sports_complex', 'private', 'cultural_center', 'community_center'], 'Invalid venue type'),
            size: optionalString(),
            capacity: optionalNumber(0),
            facilities: z.array(z.string()).optional(),
            accessibility: z.boolean().optional(),
        })
        .optional(),
});

module.exports = locationSchema;
