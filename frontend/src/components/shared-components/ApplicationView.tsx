import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { OnboardingFormData } from '../onboarding/schema';
import { toast } from 'react-hot-toast';
import { handleFilePreview, handleFileDownload } from '@/utils/fileHandlers';

export interface ApplicationViewProps {
  formData: OnboardingFormData;
  documents: any[];
  isHRView?: boolean;
  rejectionFeedback?: string;
  onActionClick?: {
    onDocumentPreview?: (url: string) => void;
    onDocumentDownload?: (url: string, fileName: string) => void;
  };
}

const ApplicationView: React.FC<ApplicationViewProps> = ({
  formData,
  documents = [],
  isHRView = false,
  rejectionFeedback,
  onActionClick,
}) => {
  const handlePreviewClick = (url: string) => {
    if (onActionClick?.onDocumentPreview) {
      onActionClick.onDocumentPreview(url);
    } else {
      handleFilePreview(url);
    }
  };

  const handleDownloadClick = async (fileUrl: string, fileName: string) => {
    if (onActionClick?.onDocumentDownload) {
      onActionClick.onDocumentDownload(fileUrl, fileName);
    } else {
      await handleFileDownload(fileUrl, fileName);
    }
  };

  return (
    <div className="space-y-6">
      {/* Name & Profile Section */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Name & Profile</h2>
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={formData.profilePicture} alt="Profile" />
            <AvatarFallback>
              {formData.firstName?.charAt(0)}
              {formData.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p>
                  {formData.firstName} {formData.middleName || ''} {formData.lastName}
                </p>
              </div>
              {formData.preferredName && (
                <div>
                  <p className="text-sm text-gray-500">Preferred Name</p>
                  <p>{formData.preferredName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info Section */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p>{formData.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">SSN</p>
            <p>{formData.ssn?.replace(/\d(?=\d{4})/g, '*')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p>{new Date(formData.dateOfBirth).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p>{formData.gender?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Address Section */}
      {formData.address && (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Address</h2>
          <p>
            {formData.address.addressOne}
            {formData.address.addressTwo && <span>, {formData.address.addressTwo}</span>}
            <br />
            {formData.address.city}, {formData.address.state} {formData.address.zipCode}
          </p>
        </div>
      )}

      {/* Contact Info Section */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Cell Phone</p>
            <p>{formData.cellPhone}</p>
          </div>
          {formData.workPhone && (
            <div>
              <p className="text-sm text-gray-500">Work Phone</p>
              <p>{formData.workPhone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Employment Section */}
      {formData.citizenshipStatus && (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Employment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Visa Status</p>
              <p>
                {formData.citizenshipStatus.isPermanentResident
                  ? `Permanent Resident (${formData.citizenshipStatus.type})`
                  : `Work Authorization: ${formData.citizenshipStatus.workAuthorizationType}`}
              </p>
            </div>
            {formData.citizenshipStatus.startDate && (
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p>{new Date(formData.citizenshipStatus.startDate).toLocaleDateString()}</p>
              </div>
            )}
            {formData.citizenshipStatus.expirationDate && (
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p>{new Date(formData.citizenshipStatus.expirationDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reference Section */}
      {formData.reference && (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Reference</h2>
          <p className="font-medium">
            {formData.reference.firstName} {formData.reference.middleName || ''}{' '}
            {formData.reference.lastName}
          </p>
          <p className="text-sm mt-1">
            <span className="text-gray-500">Relationship: </span>
            {formData.reference.relationship}
          </p>
          <p className="text-sm">
            <span className="text-gray-500">Phone: </span>
            {formData.reference.phone}
          </p>
          <p className="text-sm">
            <span className="text-gray-500">Email: </span>
            {formData.reference.email}
          </p>
        </div>
      )}

      {/* Emergency Contacts Section */}
      {formData.emergencyContacts && formData.emergencyContacts.length > 0 && (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Emergency Contacts</h2>
          {formData.emergencyContacts.map((contact, index) => (
            <div key={index} className="mb-4 p-3 border rounded">
              <p className="font-medium">
                {contact.firstName} {contact.middleName || ''} {contact.lastName}
              </p>
              <p className="text-sm mt-1">
                <span className="text-gray-500">Relationship: </span>
                {contact.relationship}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Phone: </span>
                {contact.phone}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Email: </span>
                {contact.email}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Documents Section */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Documents</h2>
        {documents && documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{doc.type.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-gray-500">{doc.fileName}</p>
                </div>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePreviewClick(doc.fileUrl)}
                  >
                    Preview
                  </Button>
                  {isHRView && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadClick(doc.fileUrl, doc.fileName)}
                    >
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No documents uploaded</p>
        )}
      </div>

      {/* Rejection Feedback - Only show in HR view when available */}
      {isHRView && rejectionFeedback && (
        <div className="p-6 border border-red-200 rounded-lg bg-red-50">
          <h2 className="text-lg font-semibold mb-2 text-red-700">Rejection Feedback</h2>
          <p>{rejectionFeedback}</p>
        </div>
      )}
    </div>
  );
};

export default ApplicationView;