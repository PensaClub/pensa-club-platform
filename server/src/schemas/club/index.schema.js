const { z } = require('zod');
const basicSchema = require('./basic.schema');
const detailsSchema = require('./details.schema');
const locationSchema = require('./location.schema');
const membershipSchema = require('./membership.schema');
const membersSchema = require('./members.schema');
const activitiesSchema = require('./activities.schema');

const baseSchema = z.object({
    ...basicSchema.shape,
    ...detailsSchema.shape,
    location: locationSchema.optional(),
    membership: membershipSchema.optional(),
    members: z.array(membersSchema).optional(),
    activities: activitiesSchema.optional(),
});

const create = baseSchema;
const update = baseSchema.omit({ slug: true });

module.exports = {
    create,
    update,
};
