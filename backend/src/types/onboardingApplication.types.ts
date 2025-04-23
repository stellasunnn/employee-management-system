import mongoose, { Document } from "mongoose";

export interface IOnboardingApplication extends Document {
    userId: mongoose.Types.ObjectId;
    status: "pending" | "approved" | "rejected";
    rejectionFeedback?: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    preferredName?: string;
    profilePicture?: string;
    address: {
        addressOne: string;
        addressTwo?: string;
        city: string;
        state: string;
        zipCode: string;
    };
    cellPhone: string;
    workPhone?: string;
    email: string;
    ssn: string;
    dateOfBirth: Date;
    gender: "male" | "female" | "prefer_not_to_say";


    citizenshipStatus: {
        isPermanentResident: boolean;
        type: "green_card" | "citizen" | "work_authorization";
        workAuthorizationType?: "H1-B" | "H4-EAD" | "L1" | "J1" | "F1" | "other";
        workAuthorizationOther?: string;
        expirationDate?: Date;
    };
    documents: [{
        type: "driver_license" | "passport" | "birth_certificate" | "other";
        fileName: string;
        fileUrl: string;
        uploadDate: Date;
    }];
    createdAt: Date;
    updatedAt: Date;
}