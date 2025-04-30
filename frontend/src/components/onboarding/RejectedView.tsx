import { useSelector } from 'react-redux';
import { selectFeedback} from '../../store/slices/onboardingSlice';


const RejectedView: React.FC<{ }> = () => {
  const feedback = useSelector(selectFeedback);

  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
    <p className="font-bold">Application rejected</p>
    <p>Rejection Feedback: {feedback || 'No feedback provided'}</p>
    <p className="font-bold">Resubmit your application below</p>
  </div>
  );
};
export default RejectedView;