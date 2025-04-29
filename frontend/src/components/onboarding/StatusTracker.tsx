import {checkApplicationStatus} from '@/store/slices/onboardingSlice';
import { useEffect } from 'react';
import { useDispatch} from 'react-redux';
import { AppDispatch } from '@/store/store';

const StatusTracker: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>();

    useEffect(()=>{
        dispatch(checkApplicationStatus());

        const interval = setInterval(() => {
            dispatch(checkApplicationStatus());
        }, 60000); 
        
        return () => clearInterval(interval);
    }, [dispatch]);
    return null;
};

export default StatusTracker;
