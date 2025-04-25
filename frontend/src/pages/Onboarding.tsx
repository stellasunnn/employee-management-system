import { useSelector, useDispatch } from 'react-redux';
import OnboardingForm1 from '../components/onboarding/onboarding-form1';
import OnboardingForm2 from '../components/onboarding/onboarding-form2';
import { selectCurrentStep, selectApplicationStatus,  selectFeedback} from '@/store/slices/onboardingSlice';


const Onboarding = () => {
  const currentStep = useSelector(selectCurrentStep);
  const applicationStatus = useSelector(selectApplicationStatus);
  const feedback = useSelector(selectFeedback);
  
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
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