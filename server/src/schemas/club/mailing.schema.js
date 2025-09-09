const { z } = require('zod');

const optionalString = z.string().optional();
const optionalNumber = z.number().optional();

// Contact Form Schema
const contactFormSchema = z.object({
    name: optionalString,
    email: optionalString,
    phone: optionalString,
    subject: optionalString,
    message: optionalString,
    preferredContact: optionalString,
});

// Membership Application Schema
const membershipApplicationSchema = z.object({
    name: optionalString,
    email: optionalString,
    phone: optionalString,
    age: optionalNumber,
    address: optionalString,
    motivation: optionalString,
    experience: optionalString,
});

// Volunteer Application Schema
const volunteerApplicationSchema = z.object({
    name: optionalString,
    email: optionalString,
    phone: optionalString,
    skills: optionalString,
    availability: optionalString,
    motivation: optionalString,
});

// Partnership Inquiry Schema
const partnershipInquirySchema = z.object({
    organizationName: optionalString,
    contactPerson: optionalString,
    email: optionalString,
    phone: optionalString,
    proposalType: optionalString,
    description: optionalString,
});

// Sponsorship Inquiry Schema
const sponsorshipInquirySchema = z.object({
    companyName: optionalString,
    contactPerson: optionalString,
    email: optionalString,
    phone: optionalString,
    sponsorshipType: optionalString,
    amount: optionalString,
    description: optionalString,
});

// Event Registration Schema
const eventRegistrationSchema = z.object({
    name: optionalString,
    email: optionalString,
    phone: optionalString,
    numberOfParticipants: optionalNumber,
    emergencyContact: optionalString,
    specialRequests: optionalString,
});

// Course Registration Schema
const courseRegistrationSchema = z.object({
    name: optionalString,
    email: optionalString,
    phone: optionalString,
    experience: optionalString,
    emergencyContact: optionalString,
    expectations: optionalString,
});

// Trip Registration Schema
const tripRegistrationSchema = z.object({
    name: optionalString,
    email: optionalString,
    phone: optionalString,
    numberOfParticipants: optionalNumber,
    emergencyContact: optionalString,
    specialRequests: optionalString,
});

const personalEmailSchema = z.object({
    from: optionalString,
    to: optionalString,
    subject: optionalString,
    message: optionalString,
});

module.exports = {
    contactFormSchema,
    membershipApplicationSchema,
    volunteerApplicationSchema,
    partnershipInquirySchema,
    sponsorshipInquirySchema,
    eventRegistrationSchema,
    courseRegistrationSchema,
    tripRegistrationSchema,
    personalEmailSchema,
};
