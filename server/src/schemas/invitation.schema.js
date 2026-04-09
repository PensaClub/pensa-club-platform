const { z } = require('zod');

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

const acceptInvitationSchema = z
    .object({
        token: z.string().min(1, 'Token is required.'),
        newPassword: z
            .string()
            .min(1, 'New password is required.')
            .regex(
                passwordRegex,
                'Password must be at least 8 characters long, contain at least one letter and one number.'
            ),
        reNewPassword: z.string().min(1, 'Repeat password is required.'),
    })
    .refine((data) => data.newPassword === data.reNewPassword, {
        message: 'Passwords do not match.',
        path: ['reNewPassword'],
    });

module.exports = {
    acceptInvitationSchema,
};
