// src/components/onboarding/RejectedView.tsx
import { useSelector } from 'react-redux';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { selectOnboardingData, OnboardingFormData } from '../../store/slices/onboardingSlice';
import OnboardingForm from './OnboardingForm';

interface RejectedViewProps {
  feedback: string | null;
}

const RejectedView: React.FC<RejectedViewProps> = ({ feedback }) => {
  const formData: OnboardingFormData = useSelector(selectOnboardingData);
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Rejection Notice */}
      <Alert variant="destructive" className="mb-6">
        <AlertTitle className="text-lg font-bold">Application Needs Updates</AlertTitle>
        <AlertDescription>
          <p className="mb-4">
            Your application has been reviewed and requires some changes before it can be approved.
          </p>
          
          <div className="bg-white p-4 rounded border border-red-200 mt-2">
            <h3 className="font-bold mb-2">Feedback from Reviewer:</h3>
            <p className="text-red-700">{feedback}</p>
          </div>
        </AlertDescription>
      </Alert>
      
      {/* Re-render the form with existing data */}
      <OnboardingForm 
        initialData={formData} 
        isResubmission={true} 
      />
    </div>
  );
};

export default RejectedView;