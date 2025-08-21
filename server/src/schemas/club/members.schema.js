const { z } = require('zod');
const { optionalString, optionalNumber, optionalEnum } = require('./helpers');

const membersSchema = z.object({
    id: z.string().optional(),
    clubId: z.string().optional(),
    userId: z.string().optional(),

    firstName: optionalString(),
    lastName: optionalString(),
    phone: optionalString(),
    email: optionalString(),
    address: optionalString(),

    photo: z
        .object({
            src: optionalString(),
            alt: optionalString(),
        })
        .optional(),

    joinDate: optionalString(), // YYYY-MM-DD format
    isActive: z.boolean().optional(),
    role: optionalEnum(
        [
            'председател',
            'заместник-председател',
            'секретар',
            'касиер',
            'културен деец',
            'треньор-координатор',
            'инструктор йога',
            'координатор проекти',
            'член',
        ],
        'Invalid role'
    ),
    status: optionalString(),
    preferences: z.record(z.any()).optional(),
});

module.exports = membersSchema;
