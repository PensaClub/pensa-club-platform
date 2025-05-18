const { z } = require('zod');

const usernameRegex = /^[a-zA-Zа-яА-Я][a-zA-Zа-яА-Я0-9_-]{6,16}$/;
const phoneRegex = /^(?:\+\d{7,15}|\d{10})$/;
const nameRegex = /^[a-zA-Zа-яА-Я0-9_]+(-[a-zA-Zа-яА-Я0-9_]+)*$/i;
const dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;

const baseUserDetailsSchema = z.object({
    username: z
        .string()
        .regex(usernameRegex, 'Username must be 6-16 chars, using letters, numbers, or underscores, and include both Cyrillic or Latin alphabets.')
        .min(1, 'Username is required.'),
    firstName: z
        .string()
        .regex(nameRegex, 'First name must be 3-20 chars, using letters, numbers, or underscores, and include both Cyrillic or Latin alphabets.')
        .min(3, 'First name must be at least 3 characters.')
        .max(20, 'First name must not exceed 20 characters.')
        .nullable()
        .optional(),
    lastName: z
        .string()
        .regex(nameRegex, 'Last name must be 3-20 chars, using letters, numbers, or underscores, and include both Cyrillic or Latin alphabets.')
        .min(3, 'Last name must be at least 3 characters.')
        .max(20, 'Last name must not exceed 20 characters.')
        .nullable()
        .optional(),
    phoneNumber: z.string().regex(phoneRegex, 'Invalid phone number.').nullable().optional(),
    gender: z.enum(['male', 'female', 'other']).nullable().optional(),
    birthDate: z
        .string()
        .regex(dateRegex, 'Date format must be YYYY-MM-DD and cannot be in the future.')
        .refine((date) => new Date(date) <= new Date(), 'Birth date cannot be in the future')
        .nullable()
        .optional(),
    region: z.string().min(1, 'Region is required.'),
    skills: z.array(z.string()).default([]),
    interestOptions: z.array(z.string()).default([]),
    workOptions: z.array(z.string()).default([]),
    imageURL: z.string().nullable().optional(),
    firebaseImagePath: z.string().nullable().optional(),
});

const userDetailsSchema = baseUserDetailsSchema
    .refine(
        (data) => {
            const requiredFields = ['username', 'region'];
            return requiredFields.every((field) => data[field] && data[field].trim() !== '');
        },
        {
            message: 'Required fields cannot be empty',
            path: ['username', 'region'],
        }
    )
    .transform((data) => {
        Object.keys(data).forEach((key) => {
            if (data[key] === '') {
                data[key] = null;
            }
        });
        return data;
    });

const updateUserDetailsSchema = baseUserDetailsSchema
    .partial()
    .transform((data) => {
        Object.keys(data).forEach((key) => {
            if (data[key] === '') {
                data[key] = null;
            }
        });
        return data;
    })
    .refine(
        (data) => {
            if ('region' in data && (data.region === null || data.region === '')) return false;
            if ('username' in data && (data.username === null || data.username === '')) return false;
            return true;
        },
        {
            message: 'Region and username cannot be empty or null if provided.',
            path: ['region', 'username'],
        }
    );

module.exports = {
    userDetailsSchema,
    updateUserDetailsSchema,
};
