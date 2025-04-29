// Application status enum
export enum ApplicationStatus {
  NeverSubmitted = 'NEVER_SUBMITTED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Approved = 'APPROVED'
}

// Gender enum
export enum Gender {
  Male = 'male',
  Female = 'female',
  PreferNotToSay = 'prefer_not_to_say'
}

// Citizenship type enum
export enum CitizenshipType {
  GreenCard = 'green_card',
  Citizen = 'citizen',
  WorkAuthorization = 'work_authorization'
}

// Work authorization type enum
export enum WorkAuthorizationType {
  H1B = 'H1-B',
  H4 = 'H4',
  L2 = 'L2',
  F1 = 'F1',
  Other = 'other'
}

// Document type enum
export enum DocumentType {
  DriverLicense = 'driver_license',
  WorkAuthorization = 'work_authorization',
  OptReceipt = 'opt_receipt',
  Other = 'other'
}

// Document type
export interface Document {
  type: DocumentType;
  fileName: string;
  fileUrl?: string;
  id?: string;
  uploadDate?: Date | string;
}

// Address type
export interface Address {
  addressOne: string;
  addressTwo?: string;
  city: string;
  state: string;
  zipCode: string;
}

// Contact person type (for references and emergency contacts)
export interface Contact {
  firstName: string;
  middleName?: string;
  lastName: string;
  phone: string;
  email: string;
  relationship: string;
}

// Citizenship status type
export interface CitizenshipStatus {
  isPermanentResident: boolean;
  type: CitizenshipType | undefined;
  workAuthorizationType?: WorkAuthorizationType | undefined;
  workAuthorizationOther?: string;
  startDate?: string;
  expirationDate?: string;
}

// Complete onboarding form data type
export interface OnboardingFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  profilePicture?: string;
  address: Address;
  cellPhone: string;
  workPhone?: string;
  email: string;
  ssn: string;
  dateOfBirth: string;
  gender: Gender | undefined;
  
  citizenshipStatus?: CitizenshipStatus;
  reference?: Contact;
  emergencyContacts?: Contact[];
  documents?: Document[];
}

// API response types
export interface ApplicationStatusResponse {
  status: ApplicationStatus;
  feedback?: string;
  formData?: Partial<OnboardingFormData>;
  documents?: Document[];
}

export interface DocumentResponse {
  url: string;
}

export interface DocumentPreviewResponse {
  url: string;
}

export interface UploadDocumentResponse extends Document {
  id: string;
  uploadDate: string;
}