const { z } = require('zod');

const mentorApplicationSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters.' })
    .max(100, { message: 'Name must be less than 100 characters.' }),

  email: z
    .string()
    .email({ message: 'Invalid email format.' }),

  phone: z
    .string()
    .min(8, { message: 'Phone number must be at least 8 characters.' })
    .max(20, { message: 'Phone number must be less than 20 characters.' }),

  age: z
    .string()                                    // ← Приема string
    .transform((val) => parseInt(val, 10))       // ← Преобразува в number
    .pipe(                                       // ← Продължава валидацията
      z.number()
        .int({ message: 'Age must be an integer.' })
        .min(18, { message: 'Age must be at least 18.' })
        .max(100, { message: 'Age must be less than 100.' })
    ),
  country: z
    .string()
    .length(2, { message: 'Country must be a 2-letter code (e.g., BG, DE, AT).' })
    .optional()
    .default('BG'),
    
  education: z
    .string()
    .optional()
    .nullable(),

  specialization: z
    .string()
    .optional()
    .nullable(),

  experience: z
    .string()
    .optional()
    .nullable(),

  motivation: z
    .string()
    .optional()
    .nullable(),

  availability: z
    .string()
    .optional()
    .nullable(),

  languages: z
    .array(z.string())
    .optional()
    .default([]),

  viber: z
    .string()
    .optional()
    .nullable(),

  facebook: z
    .string()
    .optional()
    .nullable(),

  linkedin: z
    .string()
    .optional()
    .nullable(),

  otherContact: z
    .string()
    .optional()
    .nullable(),

  priorityContact: z
    .enum(['email', 'phone', 'viber', 'facebook', 'linkedin', 'other'])
    .default('email'),

  photoUrl: z
    .string()
    .url({ message: 'Photo URL must be a valid URL.' })
    .optional()
    .nullable(),

  cvUrl: z
    .string()
    .url({ message: 'CV URL must be a valid URL.' })
    .optional()
    .nullable(),

  cvOriginalName: z
    .string()
    .optional()
    .nullable(),

  cvStoragePath: z
    .string()
    .optional()
    .nullable(),
});

module.exports = {
  mentorApplicationSchema,
};