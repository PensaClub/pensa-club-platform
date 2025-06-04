import { z } from 'zod';

// Base schemas for common types
const CoordinatesSchema = z.object({
    lat: z.number().nullable(),
    lng: z.number().nullable(),
});

const InitiativeStatus = z.enum(['in-progress', 'active', 'planned', 'completed']);
const CampaignStatus = z.enum(['open', 'closed']);
const FileType = z.enum(['pdf', 'docx']);

const ImageSchema = z.object({
    src: z.string().nullable(),
    alt: z.string().nullable(),
});

const ContactSchema = z.object({
    name: z.string(),
    position: z.string(),
    email: z.string().email(),
    phone: z.string(),
    image: z.string().url(),
});

const AdditionalContactSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    position: z.string().optional(),
    image: z.string().url().optional(),
});

const SectionSchema = z.object({
    titleSlug: z.string().min(1),
    title: z.string().min(1),
    content: z.string().nullable(),
    image: ImageSchema.optional(),
});

const ProjectSchema = z.object({
    titleSlug: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    description: z.string().nullable(),
    status: InitiativeStatus,
    image: z.string().url().nullable(),
    link: z.string().nullable(),
    coordinates: CoordinatesSchema,
});

const DownloadMaterialSchema = z.object({
    titleSlug: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    fileType: FileType,
    fileSize: z.string(),
    downloadUrl: z.string().nullable(),
    image: ImageSchema.optional(),
});

const PublishedContentSchema = z.object({
    titleSlug: z.string().min(1),
    title: z.string().min(1),
    description: z.string().nullable(),
    link: z.string().nullable(),
    author: z.string().optional(),
    publishedAt: z.string().datetime(),
    image: ImageSchema.optional(),
});

const InitiativeSchema = z.object({
    slug: z.string(),
    title: z.string(),
    shortDescription: z.string(),
    category: z.string(),
    address: z.string().nullable(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    status: z.enum(['active', 'inactive', 'draft']),
    campaignStatus: z.enum(['open', 'closed', 'pending']),
    commentsEnabled: z.boolean(),
    mainImage: ImageSchema,
    contact: ContactSchema,
    additionalContacts: z.array(AdditionalContactSchema).optional(),
    sections: z.array(SectionSchema),
    projects: z.array(ProjectSchema),
    downloadMaterials: z.array(DownloadMaterialSchema),
    stories: z.array(PublishedContentSchema),
    publications: z.array(PublishedContentSchema),
});

const UpdateInitiativeSchema = InitiativeSchema.partial();

export {
    InitiativeSchema,
    UpdateInitiativeSchema,
    ContactSchema,
    AdditionalContactSchema,
    SectionSchema,
    ProjectSchema,
    DownloadMaterialSchema,
    PublishedContentSchema,
    ImageSchema,
    CoordinatesSchema,
    InitiativeStatus,
    CampaignStatus,
    FileType,
};
