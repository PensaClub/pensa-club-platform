const { z } = require('zod');

const transferOwnershipSchema = z.object({
    email: z.string().email('Invalid email format'),
});

module.exports = transferOwnershipSchema;
