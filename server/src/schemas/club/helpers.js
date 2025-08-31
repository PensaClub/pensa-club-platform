const { z } = require('zod');

// Helper function to transform empty strings to null
const emptyStringToNull = (value) => {
    if (typeof value === 'string' && value.trim() === '') {
        return null;
    }
    return value;
};

// Helper for string fields that can be empty
const optionalString = () => z.string().transform(emptyStringToNull).nullish();

// Helper for required string fields
const requiredString = (errorMessage = 'This field is required') =>
    z
        .string()
        .transform(emptyStringToNull)
        .refine((val) => val !== null, errorMessage);

// Helper for number fields that can be empty strings
const optionalNumber = (min = null, max = null) =>
    z
        .union([
            z.string().transform((val) => {
                if (val.trim() === '') return null;
                const num = parseInt(val);
                return isNaN(num) ? null : num;
            }),
            z.number(),
        ])
        .refine(
            (val) => {
                if (val === null) return true;
                if (min !== null && val < min) return false;
                if (max !== null && val > max) return false;
                return true;
            },
            {
                message: `Number must be between ${min || 'any'} and ${max || 'any'}`,
            }
        )
        .optional();

// Helper for enum fields
const optionalEnum = (values, errorMessage) =>
    z
        .enum(values, {
            errorMap: () => ({ message: errorMessage }),
        })
        .optional();

module.exports = {
    emptyStringToNull,
    optionalString,
    requiredString,
    optionalNumber,
    optionalEnum,
};
