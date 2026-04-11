const { z } = require('zod');

const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

const userAccountSchema = z.object({
    email: z.string().email('Invalid email format.').regex(emailRegex, 'Invalid email format.').min(1, 'Email is required.'),
    password: z.string().regex(passwordRegex, 'Password must be at least 8 characters long, contain at least one letter and one number.').nullable().optional(),
    is_google_user: z.boolean().default(false),
    role: z.enum(['admin', 'moderator', 'user', 'guest', 'limited']).default('user'),
    role_change_comment: z.string().max(1000, 'Maximum comment length limit of 1000 characters is reached.').nullable().optional(),
    finished: z.boolean().default(false),
    reset_token: z.string().nullable().optional(),
    token_expiration: z.date().nullable().optional(),
});

const registerSchema = userAccountSchema
    .omit({
        role: true,
        role_change_comment: true,
        reset_token: true,
        token_expiration: true,
    })
    .extend({
        password: z
            .string()
            .min(1, 'Password is required.')
            .regex(passwordRegex, 'Password must be at least 8 characters long, contain at least one letter and one number.'),
        rePassword: z.string().min(1, 'Repeat password is required.'),
    })
    .refine((data) => data.password === data.rePassword, {
        message: "Passwords don't match",
        path: ['rePassword'],
    });

const loginSchema = z.object({
    email: z.string().email('Invalid email format.').min(1, 'Email is required.'),
    password: z.string().min(1, 'Password is required.'),
});

const googleAuthSchema = z.object({
    credential: z.string().min(1, 'No credential provided'),
});

const resetRequestSchema = z.object({
    email: z.string().email('Invalid email format.').min(1, 'Email is required.'),
});

const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(1, 'New password is required.')
            .regex(passwordRegex, 'New password must be at least 8 characters long, contain at least one letter and one number.'),
        reNewPassword: z.string().min(1, 'Repeat password is required.'),
        tokenType: z.enum(['jwt', 'reset'], {
            errorMap: () => ({ message: 'Invalid token type.' }),
        }),
        token: z.string().min(1, 'Token is required.'),
        oldPassword: z.string().optional().nullable(),
        smsCode: z.string().regex(/^\d{6}$/, 'SMS code must be 6 digits.').optional().nullable(),
    })
    .refine((data) => data.newPassword === data.reNewPassword, {
        message: 'Repeat password does not match.',
        path: ['reNewPassword'],
    })
    .refine(
        (data) => {
            if (data.tokenType === 'jwt' && data.oldPassword) {
                return data.newPassword !== data.oldPassword;
            }
            return true;
        },
        {
            message: 'Old and new password are the same.',
            path: ['newPassword'],
        }
    );

module.exports = {
    registerSchema,
    loginSchema,
    googleAuthSchema,
    resetRequestSchema,
    resetPasswordSchema,
};
