import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadUser, logout } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store/store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import {
  resetForm,
  selectOnboardingData,
  selectOnboardingStatus,
  selectOnboardingError,
  setCurrentStep,
  updateFormData,
  selectApplicationStatus,
  selectDocuments,
  fetchApplicationData,
  setRequestFromHomeState,
  selectRequestFromHomeState
} from '@/store/slices/onboardingSlice';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import OnboardingFormOne from '../components/onboarding/onboarding-form1';
import OnboardingFormTwo from '../components/onboarding/onboarding-form2';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const applicationStatus = useSelector(selectApplicationStatus);
  const onboardingStatus = useSelector(selectOnboardingStatus);
  const requestFromHomeState = useSelector(selectRequestFromHomeState);
  const formData = useSelector(selectOnboardingData);
  const documents = useSelector(selectDocuments) || [];
  const [editMode, setEditMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchApplicationData())
  }, [dispatch, applicationStatus])

  useEffect(() => {
    if(requestFromHomeState === 'submit_complete'){
      setEditMode(false);
      dispatch(setRequestFromHomeState('home'))
    }
  }, [dispatch, requestFromHomeState, setRequestFromHomeState, setEditMode])

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSave = () => {
    dispatch(setRequestFromHomeState('submit_request_one'))
  };

  const handleCancel = () => {
    setShowConfirm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {applicationStatus === 'approved' && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
              <p className="font-bold">Your onboarding application is approved</p>
            </div>
          )}
          {applicationStatus !== 'approved' && (
            <Card>
              <CardHeader>
                <CardTitle>User Information Page</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-muted-foreground">Username</div>
                    <div className="col-span-2">{user.username}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                    <div className="col-span-2">{user.email}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {applicationStatus === 'approved' && (
            <div className="max-w-4xl mx-auto py-8">
              <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Personal Information</h1>
                {!editMode ? (
                  <Button className="text-sm" onClick={() => setEditMode(true)}>Edit information</Button>
                ) : (
                  <div className="space-x-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save All</Button>
                  </div>
                )}
              </div>
              {/* edit mode */}
              {editMode ? (
                <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
                  <OnboardingFormOne initialData={formData} isResubmission={false} isEditMode={true}/>
                  <OnboardingFormTwo initialData={formData} isResubmission={false} isEditMode={true}/>
                  
                </div>
              ) : (
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
                              <Button variant="outline" size="sm" onClick={() => window.open(doc.fileUrl, '_blank')}>
                                Preview
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  // link.href = doc.fileUrl;
                                  link.download = doc.fileName;
                                  link.click();
                                }}
                              >
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No documents uploaded</p>
                    )}
                  </div>
                </div>
              )}

              <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                  <h3 className="text-lg font-medium">Discard changes?</h3>
                  <p className="mt-2">Are you sure you want to discard all your changes?</p>
                  <DialogFooter className="mt-4 space-x-2">
                    <Button variant="outline" onClick={() => setShowConfirm(false)}>
                      No, keep editing
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setShowConfirm(false);
                        setEditMode(false);
                      }}
                    >
                      Yes, discard changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
