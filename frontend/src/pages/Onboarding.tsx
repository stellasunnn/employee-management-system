import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import OnboardingForm1 from '../components/onboarding/onboarding-form1';
import OnboardingForm2 from '../components/onboarding/onboarding-form2';
import PendingView from '../components/onboarding/PendingView';
import RejectedView from '../components/onboarding/RejectedView';
import StatusTracker from '../components/onboarding/statusTracker';
import { 
  selectCurrentStep, 
  selectApplicationStatus, 
  selectFeedback,
  checkApplicationStatus,
  ApplicationStatus
} from '@/store/slices/onboardingSlice';
import { AppDispatch } from '@/store/store';

const Onboarding = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentStep = useSelector(selectCurrentStep);
  const applicationStatus = useSelector(selectApplicationStatus);
  const feedback = useSelector(selectFeedback);
  
  // Check status on initial load
  useEffect(() => {
    dispatch(checkApplicationStatus());
  }, [dispatch]);
  
  // First, check application status
  if (applicationStatus === ApplicationStatus.Pending) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <StatusTracker />
        <PendingView />
      </div>
    );
  }
  
  if (applicationStatus === ApplicationStatus.Rejected) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <StatusTracker />
        <RejectedView feedback={feedback} />
      </div>
    );
  }
  
  if (applicationStatus === ApplicationStatus.Approved) {
    return <Navigate to="/home" replace />;
  }
  
  // If never submitted or form is in progress, show the multi-step form
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <StatusTracker />
      <div className="w-full">
        {currentStep === 1 ? (
          <OnboardingForm1 />
        ) : (
          <OnboardingForm2 />
        )}
      </div>
    </div>
  );
};

export default Onboarding;