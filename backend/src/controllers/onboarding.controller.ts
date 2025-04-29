import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { OnboardingApplication } from "../models/OnboardingApplication";

// Get onboarding application by user id
export const getOnboardingApplication = async (req: AuthRequest, res: Response) => {
    try {
        const application = await OnboardingApplication.findOne({ userId: req.user?.id });
        if (!application) {
            return res.status(404).json({ message: "Onboarding application not found" });
        }
        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({ message: "Error fetching onboarding application" });
    }
}

export const getOnboardingApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
      const application = await OnboardingApplication.findOne({ userId: req.user?.id });
      if (!application) {
          return res.status(404).json({ message: "Onboarding application status not found" });
      }
      res.status(200).json({status: application.status});
  } catch (error) {
      res.status(500).json({ message: "Error fetching onboarding application status" });
  }
}


// Create onboarding application    
export const createOnboardingApplication = async (req: AuthRequest, res: Response) => {
    try {
        const applicationData = {
            ...req.body,
            userId: req.user?.id,
            status: "pending"
        }

        let application = await OnboardingApplication.findOne({ userId: req.user?.id, status: "pending" });
        
        if (application) {
            return res.status(400).json({ message: "Application already exists" });
        } else {
            application = new OnboardingApplication(applicationData);
            await application.save();
            res.status(201).json(application);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating onboarding application" });
    }
}

export const uploadDocument = async (req: AuthRequest, res: Response) => {
    try {
      const { type, fileName, fileUrl } = req.body;
      
      const application = await OnboardingApplication.findOne({ userId: req.user?._id });
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
  
      application.documents.push({
        type,
        fileName,
        fileUrl,
        uploadDate: new Date()
      });
  
      await application.save();
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };

  // Admin: Update application status
export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
    try {
      const { applicationId } = req.params;
      const { status, rejectionFeedback } = req.body;
  
      const application = await OnboardingApplication.findByIdAndUpdate(
        applicationId,
        { status, rejectionFeedback },
        { new: true }
      );
  
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
  
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };