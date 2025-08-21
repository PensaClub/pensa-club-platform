const { z } = require('zod');
const basicSchema = require('./basic.schema');
const detailsSchema = require('./details.schema');
const locationSchema = require('./location.schema');
const membershipSchema = require('./membership.schema');
const membersSchema = require('./members.schema');
const activitiesSchema = require('./activities.schema');

const clubSchema = z.object({
    ...basicSchema.shape,
    ...detailsSchema.shape,
    location: locationSchema.optional(),
    membership: membershipSchema.optional(),
    members: z.array(membersSchema).optional(),
    activities: activitiesSchema.optional(),
});

module.exports = clubSchema;

module.exports.basic = basicSchema;
module.exports.details = detailsSchema;
module.exports.location = locationSchema;
module.exports.membership = membershipSchema;
module.exports.members = membersSchema;
module.exports.activities = activitiesSchema;
