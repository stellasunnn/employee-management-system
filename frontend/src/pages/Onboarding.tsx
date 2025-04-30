import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import OnboardingForm1 from '../components/onboarding/onboarding-form1';
import OnboardingForm2 from '../components/onboarding/onboarding-form2';
import PendingView from '../components/onboarding/PendingView';
import RejectedView from '../components/onboarding/RejectedView';
import StatusTracker from '../components/onboarding/StatusTracker';
import { 
  selectCurrentStep, 
  selectApplicationStatus, 
  selectOnboardingStatus,
  fetchApplicationData
} from '@/store/slices/onboardingSlice';
import { AppDispatch } from '@/store/store';

import { ApplicationStatus } from '@/components/onboarding/schema';

const Onboarding = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentStep = useSelector(selectCurrentStep);
  const applicationStatus = useSelector(selectApplicationStatus);
  const onboardingStatus = useSelector(selectOnboardingStatus)
  
  // Check status on initial load
  useEffect(() => {
    if(onboardingStatus === 'idle') {
      dispatch(fetchApplicationData());
    }
  }, [dispatch, onboardingStatus]);

  // First, check application status
  if (applicationStatus === ApplicationStatus.Pending) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <StatusTracker />
        <PendingView />
      </div>
    );
  }
  
  if (applicationStatus === ApplicationStatus.Approved) {
    return <Navigate to="/home" replace />;
  }
  
  // If never submitted or form is in progress, show the multi-step form
  return (
    <div className="flex flex-col min-h-svh w-full items-center justify-center p-6 md:p-10">
      {/* <StatusTracker /> */}
      {(applicationStatus ===  ApplicationStatus.Rejected) &&
      <div className='w-full max-w-3xl mx-auto'>
        <RejectedView />
      </div>}
  
      <div className="w-full">
        {currentStep === 1 ? (
          <OnboardingForm1 isResubmission = {applicationStatus=== ApplicationStatus.Rejected} />
        ) : (
          <OnboardingForm2 isResubmission = {applicationStatus=== ApplicationStatus.Rejected} /> 
        )}
      </div>
    </div>
  );
};

export default Onboarding;