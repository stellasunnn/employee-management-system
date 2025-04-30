import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
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
  selectRequestFromHomeState,
} from '@/store/slices/onboardingSlice';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import OnboardingFormOne from '../components/onboarding/onboarding-form1';
import OnboardingFormTwo from '../components/onboarding/onboarding-form2';
import ApplicationView from '@/components/shared-components/ApplicationView';
import { ApplicationStatus } from '@/components/onboarding/schema';

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const applicationStatus = useSelector(selectApplicationStatus);
  const onboardingStatus = useSelector(selectOnboardingStatus);
  const onboardingError = useSelector(selectOnboardingError);
  const requestFromHomeState = useSelector(selectRequestFromHomeState);
  const formData = useSelector(selectOnboardingData);
  const documents = useSelector(selectDocuments) || [];
  const [editMode, setEditMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);


  useEffect(() => {
    dispatch(fetchApplicationData());
  }, [dispatch, applicationStatus]);

  useEffect(() => {
    if (requestFromHomeState === 'submit_complete') {
      setEditMode(false);
      dispatch(setRequestFromHomeState('home'));
    }
  }, [dispatch, requestFromHomeState, setRequestFromHomeState, setEditMode]);

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
  

  // Redirect to onboarding if no application is found or if application is pending
  if (onboardingError === 'Onboarding application not found' || applicationStatus !== ApplicationStatus.Approved) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleSave = () => {
    dispatch(setRequestFromHomeState('submit_request_one'));
  };

  const handleCancel = () => {
    setShowConfirm(true);
  };

  const handleDocumentDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
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
                  <Button className="text-sm" onClick={() => setEditMode(true)}>
                    Edit information
                  </Button>
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
                  <OnboardingFormOne initialData={formData} isResubmission={false} isEditMode={true} />
                  <OnboardingFormTwo initialData={formData} isResubmission={false} isEditMode={true} />
                </div>
              ) : (
                <ApplicationView
                  formData={formData}
                  documents={documents}
                  onActionClick={{
                    onDocumentDownload: handleDocumentDownload,
                  }}
                />
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
