import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { OnboardingApplication } from "../models/OnboardingApplication";

// Get personal information
export const getPersonalInfo = async (req: AuthRequest, res: Response) => {
    try {
        const application = await OnboardingApplication.findOne({ userId: req.user?.id });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }
        
        // Return only personal information fields
        const personalInfo = {
            firstName: application.firstName,
            middleName: application.middleName,
            lastName: application.lastName,
            preferredName: application.preferredName,
            profilePicture: application.profilePicture,
            email: application.email,
            ssn: application.ssn,
            dateOfBirth: application.dateOfBirth,
            gender: application.gender,
            address: application.address,
            cellPhone: application.cellPhone,
            workPhone: application.workPhone,
            documents: application.documents
        };
        
        res.status(200).json(personalInfo);
    } catch (error) {
        res.status(500).json({ message: "Error fetching personal information" });
    }
};

// Update personal information
export const updatePersonalInfo = async (req: AuthRequest, res: Response) => {
    try {
        const application = await OnboardingApplication.findOne({ userId: req.user?.id });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Update only allowed fields
        const allowedFields = [
            'firstName', 'middleName', 'lastName', 'preferredName',
            'email', 'ssn', 'dateOfBirth', 'gender',
            'address', 'cellPhone', 'workPhone'
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                (application as any)[field] = req.body[field];
            }
        }

        application.updatedAt = new Date();
        await application.save();

        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({ message: "Error updating personal information" });
    }
};

// Update profile picture
// export const updateProfilePicture = async (req: AuthRequest, res: Response) => {
//     try {
//         const { profilePicture } = req.body;
//         if (!profilePicture) {
//             return res.status(400).json({ message: "Profile picture is required" });
//         }

//         const application = await OnboardingApplication.findOne({ userId: req.user?.id });
//         if (!application) {
//             return res.status(404).json({ message: "Application not found" });
//         }

//         application.profilePicture = profilePicture;
//         application.updatedAt = new Date();
//         await application.save();

//         res.status(200).json(application);
//     } catch (error) {
//         res.status(500).json({ message: "Error updating profile picture" });
//     }
// };
