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


// Create or replace onboarding application
export const createOnboardingApplication = async (req: AuthRequest, res: Response) => {
  try {
      const userId = req.user?.id;
      
      // Remove _id if present to avoid duplicate key errors
      const requestData = { ...req.body };
      if (requestData._id) {
          delete requestData._id;
      }
      
      // Find any existing application for this user
      const existingApplication = await OnboardingApplication.findOne({ userId: userId });
      
      if (existingApplication) {
          if (existingApplication.status === "pending") {
              // Don't replace pending applications
              return res.status(400).json({ message: "Application already exists" });
          } else {
              // Replace non-pending applications while preserving _id and status
              const applicationData = {
                  ...requestData,
                  userId: userId,
                  status: existingApplication.status // Preserve the existing status
              };
              
              // Use replaceOne to completely replace the document except for _id
              await OnboardingApplication.replaceOne(
                  { _id: existingApplication._id },
                  applicationData
              );
              
              // Fetch the replaced document to return
              const replacedApplication = await OnboardingApplication.findById(existingApplication._id);
              return res.status(200).json(replacedApplication);
          }
      } else {
          // Create new application if none exists, with pending status
          const newApplication = new OnboardingApplication({
              ...requestData,
              userId: userId,
              status: "pending" // Only set pending status for new applications
          });
          await newApplication.save();
          return res.status(201).json(newApplication);
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