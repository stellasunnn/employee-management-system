import * as z from 'zod';

export const Gender = {
  Male: 'male',
  Female: 'female',
  PreferNotToSay: 'prefer_not_to_say',
} as const;

export const CitizenshipType = {
  GreenCard: 'green_card',
  Citizen: 'citizen',
  WorkAuthorization: 'work_authorization',
} as const;

export const WorkAuthorizationType = {
  H1B: 'H1-B',
  H4EAD: 'H4-EAD', 
  L1: 'L1',
  J1: 'J1',
  F1: 'F1',
  Other: 'other',
} as const;

export const DocumentType = {
  DriverLicense: 'driver_license',
  Passport: 'passport',
  BirthCertificate: 'birth_certificate',
  Other: 'other',
} as const;

// Full schema 
export const fullFormSchema = z.object({
  // Page 1: 
  firstName: z.string().min(1, { message: 'First name is required.' }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  preferredName: z.string().optional(),
  
  // Profile picture
  profilePicture: z.string().optional(),
  
  // Address
  address: z.object({
    addressOne: z.string().min(1, { message: 'Address line 1 is required.' }),
    addressTwo: z.string().optional(),
    city: z.string().min(1, { message: 'City is required.' }),
    state: z.string().min(1, { message: 'State is required.' }),
    zipCode: z.string().min(5, { message: 'Valid ZIP code is required.' }),
  }),
  
  // Contact Information
  cellPhone: z.string().regex(/^\d{10}$/, {
    message: 'Please enter a valid 10-digit phone number.',
  }),
  workPhone: z.string().optional(),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  
  // Identification
  ssn: z.string().regex(/^\d{9}$/, {
    message: 'Please enter a valid 9-digit SSN.',
  }),
  dateOfBirth: z.string().datetime({
    message: 'Date of birth is required.',
  }),
  gender: z.enum([Gender.Male, Gender.Female, Gender.PreferNotToSay], {
    message: 'Gender is required.',
  }),
  
  // Page 2: 
  citizenshipStatus: z.object({
    isPermanentResident: z.boolean(),
    type: z.enum([CitizenshipType.GreenCard, CitizenshipType.Citizen, CitizenshipType.WorkAuthorization]),
    workAuthorizationType: z.enum([
      WorkAuthorizationType.H1B,
      WorkAuthorizationType.H4EAD,
      WorkAuthorizationType.L1,
      WorkAuthorizationType.J1,
      WorkAuthorizationType.F1,
      WorkAuthorizationType.Other
    ]).optional(),
    workAuthorizationOther: z.string().optional(),
    expirationDate: z.string().datetime().optional(),
  }),
  
  // Reference information
  reference: z.object({
    firstName: z.string().min(1, { message: 'First name is required.' }),
    middleName: z.string().optional(),
    lastName: z.string().min(1, { message: 'Last name is required.' }),
    phone: z.string().regex(/^\d{10}$/, {
      message: 'Please enter a valid phone number.',
    }),
    email: z.string().email({
      message: 'Please enter a valid email address.',
    }),
    relationship: z.string().min(1, { message: 'Relationship is required.' }),
  }).optional(),
  
  // Emergency contacts
  emergencyContacts: z.array(
    z.object({
      firstName: z.string().min(1, { message: 'First name is required.' }),
      middleName: z.string().optional(),
      lastName: z.string().min(1, { message: 'Last name is required.' }),
      phone: z.string().regex(/^\d{10}$/, {
        message: 'Please enter a valid phone number.',
      }),
      email: z.string().email({
        message: 'Please enter a valid email address.',
      }),
      relationship: z.string().min(1, { message: 'Relationship is required.' }),
    })
  ).min(1, { message: 'At least one emergency contact is required.' }).optional(),
  
  // Documents
  documents: z.array(
    z.object({
      type: z.enum([
        DocumentType.DriverLicense,
        DocumentType.Passport,
        DocumentType.BirthCertificate,
        DocumentType.Other
      ]),
      fileName: z.string(),
      fileUrl: z.string().optional(),
      uploadDate: z.date().optional(),
    })
  ).optional(),
});

// Page 1 schema - personal information
export const pageOneSchema = fullFormSchema.pick({
  firstName: true,
  middleName: true,
  lastName: true,
  preferredName: true,
  profilePicture: true,
  address: true,
  cellPhone: true,
  workPhone: true,
  email: true,
  ssn: true,
  dateOfBirth: true,
  gender: true,
});

// Page 2 schema - citizenship, references, emergency contacts, documents
export const pageTwoSchema = fullFormSchema.pick({
  citizenshipStatus: true,
  reference: true,
  emergencyContacts: true,
  documents: true,
});

export type FullFormValues = z.infer<typeof fullFormSchema>;
export type pageOneValues = z.infer<typeof pageOneSchema>;
export type pageTwoValues = z.infer<typeof pageTwoSchema>;