import { useSelector } from 'react-redux';
import { selectOnboardingData, selectDocuments} from '../../store/slices/onboardingSlice';

import DocumentList from './DocumentList';

const PendingView: React.FC = () => {
  const formData = useSelector(selectOnboardingData);
  const documents = useSelector(selectDocuments) || []
  
  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* Status Banner */}
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
        <p className="font-bold">Application Under Review</p>
        <p>Please wait for HR to review your application.</p>
      </div>
      
      {/* Personal Information */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Your Information</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p>{formData.firstName} {formData.middleName || ''} {formData.lastName}</p>
            </div>
            {formData.preferredName && (
              <div>
                <p className="text-sm text-gray-500">Preferred Name</p>
                <p>{formData.preferredName}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{formData.email}</p>
            </div>
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
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p>{new Date(formData.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p>{formData.gender}</p>
            </div>
          </div>
        </div>
        
        {/* Address */}
        {formData.address && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Address</h3>
            <p>
              {formData.address.addressOne}
              {formData.address.addressTwo && <span>, {formData.address.addressTwo}</span>}
              <br />
              {formData.address.city}, {formData.address.state} {formData.address.zipCode}
            </p>
          </div>
        )}
        
        {/* Citizenship Status */}
        {formData.citizenshipStatus && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Citizenship Status</h3>
            <p>
              {formData.citizenshipStatus.isPermanentResident 
                ? `Permanent Resident (${formData.citizenshipStatus.type})` 
                : `Work Authorization: ${formData.citizenshipStatus.workAuthorizationType}`}
            </p>
            {formData.citizenshipStatus.expirationDate && (
              <p className="mt-1">
                <span className="text-sm text-gray-500">Expiration Date: </span>
                {new Date(formData.citizenshipStatus.expirationDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
        
        {/* Reference */}
        {formData.reference && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Reference</h3>
            <p>
              {formData.reference.firstName} {formData.reference.lastName}
              <br />
              <span className="text-sm text-gray-500">Relationship: </span>
              {formData.reference.relationship}
              <br />
              <span className="text-sm text-gray-500">Contact: </span>
              {formData.reference.phone}, {formData.reference.email}
            </p>
          </div>
        )}
        
        {/* Emergency Contacts */}
        {formData.emergencyContacts && formData.emergencyContacts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Emergency Contacts</h3>
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
      </div>
      
      {/* Documents */}
      <div>
        <h2 className="text-xl font-bold mb-4">Uploaded Documents</h2>
        {documents && documents.length > 0 ? (
          <DocumentList documents={documents} />
        ) : (
          <p>No documents uploaded</p>
        )}
      </div>
    </div>
  );
};

export default PendingView;