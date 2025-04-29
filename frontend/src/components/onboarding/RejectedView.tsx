// src/components/onboarding/RejectedView.tsx
import { useSelector } from 'react-redux';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { selectOnboardingData, OnboardingFormData } from '../../store/slices/onboardingSlice';
import OnboardingForm from './onboarding-form1';

interface RejectedViewProps {
  feedback: string | null;
}

const RejectedView: React.FC<RejectedViewProps> = ({ feedback }) => {
  // const formData: OnboardingFormData = useSelector(selectOnboardingData);
  
  return (
    <div/>
  );
};

export default RejectedView;