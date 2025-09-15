const { z } = require('zod');
const { optionalString, requiredString, optionalNumber, optionalEnum } = require('./helpers');

const basicSchema = z.object({
    // Core identification
    id: z.string().optional(),

    slug: optionalString(),

    name: optionalString(),

    shortDescription: optionalString(),

    // Club information
    foundedYear: z.union([
        z.literal(0),
        optionalNumber(1900, new Date().getFullYear())
    ]).optional(),

    status: optionalString(), // TODO: change to enum when FE values are finalized

    category: optionalString(), // TODO: change to enum when FE values are finalized

    // Media
    logo: optionalString(),

    mainImage: optionalString(),

    // Admin fields
    createdBy: optionalString(),

    isVerified: z.boolean().optional(),
    isPublic: z.boolean().optional(),

    rating: optionalNumber(0, 5),
    views: optionalNumber(0),
    followers: optionalNumber(0),

    tags: z.array(z.string()).optional(),
});

module.exports = basicSchema;
