import { useSelector } from 'react-redux';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { selectOnboardingData} from '../../store/slices/onboardingSlice';

interface RejectedViewProps {
  feedback: string | null;
}

const RejectedView: React.FC<RejectedViewProps> = ({ feedback }) => {
  const formData = useSelector(selectOnboardingData)
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
    <p className="font-bold">Application rejected</p>
    {/* <p>{formData.feedback}</p> */}
    <p className="font-bold">Resubmit your application below</p>
  </div>
  );
};
export default RejectedView;