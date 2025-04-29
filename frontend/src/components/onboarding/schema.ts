import * as z from 'zod';

export const Gender = {
  Male: 'male',
  Female: 'female',
  PreferNotToSay: 'prefer_not_to_say',
} as const;

export enum CitizenshipType {
  GreenCard = 'green_card',
  Citizen = 'citizen',
  WorkAuthorization = 'work_authorization'
}

export enum ApplicationStatus {
  NeverSubmitted = 'never_submitted',
  Pending = 'pending',
  Rejected = 'rejected',
  Approved = 'approved'
}

export const WorkAuthorizationType = {
  H1B: 'H1-B',
  H4: 'H4', 
  L2: 'L2',
  F1: 'F1',
  Other: 'other',
} as const;

export const DocumentType = {
  DriverLicense: 'driver_license',
  WorkAuthorization: 'work_authorization',
  OPTReceipt: 'opt_receipt',
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
  dateOfBirth: z.string()
  .datetime({
    message: 'Date of birth must be a valid date.',
  })
  .refine((date) => {
    const parsedDate = new Date(date);
    const today = new Date();
    return parsedDate <= today;
  }, {
    message: 'Date of birth cannot be in the future.',
  })
  .refine((date) => {
    const parsedDate = new Date(date);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 120); // Reasonable max age of 120 years
    return parsedDate >= minDate;
  }, {
    message: 'Date of birth is not within a valid range.',
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
      WorkAuthorizationType.H4,
      WorkAuthorizationType.L2,
      WorkAuthorizationType.F1,
      WorkAuthorizationType.Other
    ]).optional(),
    workAuthorizationOther: z.string().optional(),
    startDate: z.union([
      z.string().datetime({ message: 'Start date must be a valid date.' }),
      z.literal('')
    ]),
    expirationDate: z.union([
      z.string().datetime({ message: 'Expiration date must be a valid date.' }),
      z.literal('')
    ])
  }).superRefine((data, ctx) => {
    console.log(data.isPermanentResident)
    if (!data.isPermanentResident) {
      if (!data.startDate || data.startDate === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Start date is required for non permanent residents',
          path: ['startDate']
        });
      }
      
      if (!data.expirationDate || data.expirationDate === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Expiration date is required for non permanent residents',
          path: ['expirationDate']
        });
      }
    }
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
  ).optional(),
  
  // Documents
  documents: z.array(
    z.object({
      type: z.enum([
        DocumentType.DriverLicense,
        DocumentType.WorkAuthorization,
        DocumentType.OPTReceipt,
        DocumentType.Other
      ]),
      fileName: z.string(),
      fileUrl: z.string().optional(),
      uploadDate: z.string().optional(),
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
}).partial({
  reference:true,
  emergencyContacts: true
});



export type pageOneValues = z.infer<typeof pageOneSchema>;

export type pageTwoValues = z.infer<typeof pageTwoSchema>;

export type OnboardingFormData = z.infer<typeof fullFormSchema>

export type Documents = z.infer<typeof fullFormSchema>["documents"]